import { Play } from 'lucide-react';
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

type FilePlayerProps = {
  url: string;
  playing?: boolean;
  controls?: boolean;
  playsinline?: boolean;
  width?: string | number;
  height?: string | number;
  muted?: boolean;
  onPlay?: () => void;
  light?: ReactNode | boolean;
  loop?: boolean;
};

const FilePlayer = ({
  url,
  playing = false,
  controls = false,
  playsinline = false,
  width = '100%',
  height = '100%',
  muted = false,
  onPlay,
  light,
  loop = false,
}: FilePlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [dismissedPreviewUrl, setDismissedPreviewUrl] = useState<string | null>(
    null,
  );
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const [showControlsUrl, setShowControlsUrl] = useState<string | null>(null);
  const [manualPlayUrl, setManualPlayUrl] = useState<string | null>(null);

  const hasLightPreview =
    light !== undefined && light !== null && light !== false;

  const isPreviewDismissed = dismissedPreviewUrl === url;
  const isLoaded = loadedUrl === url;
  const showControls = showControlsUrl === url;
  const manualPlayRequested = manualPlayUrl === url;
  const showPreview =
    hasLightPreview && !playing && !isPreviewDismissed && !isLoaded;
  const shouldAttachSource = !showPreview;
  const shouldPlay = playing || manualPlayRequested;
  const controlsEnabled = controls || showControls;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (!shouldAttachSource) {
      video.pause();
      return;
    }

    if (playsinline) {
      // iOS Safari uses this legacy attribute for reliable inline playback.
      video.setAttribute('webkit-playsinline', 'true');
    }

    if (shouldPlay) {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          // Browser autoplay policies can block programmatic play.
        });
      }
      return;
    }

    video.pause();
  }, [playsinline, shouldAttachSource, shouldPlay]);

  useEffect(() => {
    if (!playing) {
      setShowControlsUrl(null);
      setManualPlayUrl(null);
    }
  }, [playing]);

  const wrapperStyle: CSSProperties = {
    width,
    height,
  };

  const handlePreviewClick = () => {
    setDismissedPreviewUrl(url);
    setShowControlsUrl(url);
    setManualPlayUrl(url);
  };

  const handleVideoClick = () => {
    setShowControlsUrl(url);

    const video = videoRef.current;
    if (!video || !video.paused) {
      return;
    }

    setManualPlayUrl(url);
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        // Playback can be blocked by browser policies; controls remain visible.
      });
    }
  };

  return (
    <div style={wrapperStyle} className="relative">
      <video
        ref={videoRef}
        src={shouldAttachSource ? url : undefined}
        preload={shouldAttachSource ? 'metadata' : 'none'}
        controls={controlsEnabled}
        muted={muted}
        playsInline={playsinline}
        loop={loop}
        onLoadedData={() => setLoadedUrl(url)}
        onClick={handleVideoClick}
        onPlay={() => {
          setDismissedPreviewUrl(url);
          setManualPlayUrl(null);
          onPlay?.();
        }}
        style={{ width: '100%', height: '100%' }}
      />

      {showPreview && (
        <button
          type="button"
          className="absolute inset-0"
          onClick={handlePreviewClick}
          aria-label="Play preview"
        >
          {light === true ? (
            <div className="h-full w-full bg-black/20" />
          ) : (
            light
          )}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/65 text-white shadow-lg">
              <Play className="h-6 w-6 fill-current" />
            </div>
          </div>
        </button>
      )}
    </div>
  );
};

export default FilePlayer;
