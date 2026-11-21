import {
  useWindowVirtualizer,
  type VirtualItem,
} from '@tanstack/react-virtual';
import { useLayoutEffect, useState } from 'react';
import { useLocation } from 'react-router';

type ListSnapshot = {
  scrollOffset: number;
  measurements: VirtualItem[];
};

// One snapshot per history entry, so back and forward get the list as it was
const snapshots = new Map<string, ListSnapshot>();

type WindowVirtualizerOptions = Parameters<typeof useWindowVirtualizer>[0];

/**
 * useWindowVirtualizer that comes back to where it was when the user returns to the page.
 *
 * On mount the virtualizer scrolls the window to its initial offset, which is
 * 0 when coming back from another page, and the items it has not measured yet
 * get estimated heights, so the scroll position React Router restores ends up
 * on other moves. Starting from the offset and the measured heights of the last
 * visit to this history entry gives the same page as when the user left it.
 */
export const useRestoredWindowVirtualizer = (
  options: WindowVirtualizerOptions,
) => {
  const { key } = useLocation();
  const [snapshot] = useState(() => snapshots.get(key));

  const virtualizer = useWindowVirtualizer({
    ...options,
    ...(snapshot && {
      initialOffset: snapshot.scrollOffset,
      initialMeasurementsCache: snapshot.measurements,
    }),
  });

  useLayoutEffect(
    () => () => {
      snapshots.set(key, {
        scrollOffset: virtualizer.scrollOffset ?? 0,
        measurements: virtualizer.takeSnapshot(),
      });
    },
    [virtualizer, key],
  );

  return virtualizer;
};
