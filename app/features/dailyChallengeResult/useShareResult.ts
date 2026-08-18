import { useCallback, useEffect, useRef, useState } from 'react';

export type ShareStatus =
  | 'idle'
  | 'pending'
  | 'copied'
  | 'downloaded'
  | 'error';

const statusResetDelayMs = 2000;

/**
 * The person dismissed the share sheet (`AbortError`), or the browser refused
 * because one is already open (`InvalidStateError`). Neither is a failure, and
 * neither should fall through to the clipboard while a sheet is on screen.
 */
const isShareInterrupted = (error: unknown): boolean =>
  error instanceof Error &&
  (error.name === 'AbortError' || error.name === 'InvalidStateError');

/**
 * The OS share sheet is the natural action on a phone, but on desktop it is a
 * clumsy dialog and people want the result on the clipboard so they can paste
 * it into Discord or X. Chrome on Windows advertises the Web Share API, so
 * feature detection alone would send desktop users to the dialog.
 */
const isTouchPrimary = (): boolean =>
  window.matchMedia?.('(pointer: coarse)').matches === true;

const canShareImageFiles = (): boolean => {
  try {
    return (
      typeof navigator.canShare === 'function' &&
      navigator.canShare({
        // An empty probe file, so the check can run before the image has been
        // rendered while the click's user activation is still live.
        files: [new File([], 'probe.png', { type: 'image/png' })],
      })
    );
  } catch {
    return false;
  }
};

const copyTextToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

const copyImageToClipboard = async (blob: Promise<Blob>): Promise<boolean> => {
  if (typeof ClipboardItem === 'undefined' || !navigator.clipboard?.write) {
    return false;
  }

  try {
    // Handing over the promise rather than an awaited blob keeps the click's
    // user activation alive, which Safari requires.
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    return true;
  } catch {
    try {
      // Not every browser accepts a promise here.
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': await blob }),
      ]);
      return true;
    } catch {
      return false;
    }
  }
};

/**
 * Long enough for the browser to have taken the download over; revoking right
 * after the click cancels it in Firefox.
 */
const revokeDelayMs = 60_000;

const downloadBlob = (blob: Blob, fileName: string): boolean => {
  const link = document.createElement('a');
  // Browsers without the download attribute open the image in place instead of
  // saving it, so say nothing was saved rather than claiming success.
  if (!('download' in link)) {
    return false;
  }

  try {
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), revokeDelayMs);
    return true;
  } catch {
    return false;
  }
};

/**
 * Shares a result through the native share sheet on touch devices, and puts it
 * on the clipboard everywhere else (falling back to a download for images).
 * Cancelling the native share sheet is not an error.
 */
export const useShareResult = () => {
  const [status, setStatus] = useState<ShareStatus>('idle');
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // A second tap while the share sheet is open would make `navigator.share`
  // reject, and the caller would report a result over the top of the sheet.
  const inFlightRef = useRef(false);

  const clearReset = useCallback(() => {
    if (resetTimeoutRef.current !== null) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => clearReset, [clearReset]);

  const updateStatus = useCallback(
    (nextStatus: ShareStatus, autoReset = true) => {
      clearReset();
      setStatus(nextStatus);
      if (!autoReset) {
        return;
      }
      resetTimeoutRef.current = setTimeout(() => {
        setStatus('idle');
        resetTimeoutRef.current = null;
      }, statusResetDelayMs);
    },
    [clearReset],
  );

  const shareText = useCallback(
    async (text: string) => {
      if (inFlightRef.current) {
        return;
      }
      inFlightRef.current = true;

      try {
        if (navigator.share && isTouchPrimary()) {
          // Pending keeps the button disabled for as long as the sheet is up.
          updateStatus('pending', false);
          try {
            // Only `text`, since some share targets drop either `text` or `url`
            // when both are given, and the url is already the last line.
            await navigator.share({ text });
            updateStatus('idle', false);
            return;
          } catch (error) {
            if (isShareInterrupted(error)) {
              updateStatus('idle', false);
              return;
            }
          }
        }

        updateStatus((await copyTextToClipboard(text)) ? 'copied' : 'error');
      } finally {
        inFlightRef.current = false;
      }
    },
    [updateStatus],
  );

  const shareImage = useCallback(
    async (createBlob: () => Promise<Blob>, fileName: string) => {
      if (inFlightRef.current) {
        return;
      }
      inFlightRef.current = true;
      updateStatus('pending', false);

      try {
        // Start rendering, but decide which path to take from checks that do not
        // need the finished image, so the click's user activation survives.
        const useNativeShare = canShareImageFiles() && isTouchPrimary();
        const blobPromise = createBlob();

        if (useNativeShare) {
          try {
            const blob = await blobPromise;
            await navigator.share({
              files: [new File([blob], fileName, { type: 'image/png' })],
            });
            updateStatus('idle', false);
            return;
          } catch (error) {
            if (isShareInterrupted(error)) {
              updateStatus('idle', false);
              return;
            }
          }
        }

        if (await copyImageToClipboard(blobPromise)) {
          updateStatus('copied');
          return;
        }

        let blob: Blob;
        try {
          blob = await blobPromise;
        } catch {
          updateStatus('error');
          return;
        }

        updateStatus(downloadBlob(blob, fileName) ? 'downloaded' : 'error');
      } finally {
        inFlightRef.current = false;
      }
    },
    [updateStatus],
  );

  return { status, shareText, shareImage };
};
