import { getCharacterAvatarSrc } from '~/features/dailyChallengeResult/characterAvatar';
import { dailyChallengeShareUrl } from '~/features/dailyChallengeResult/shareText';

export type ResultImageAnswer = {
  isCorrect: boolean;
  /** Used to fade the matching character avatar into the tile. */
  characterName: string;
};

export type ResultImageInput = {
  /** Human readable date of the challenge, e.g. "14 August". */
  displayDate: string;
  score: number;
  totalQuestions: number;
  /** Empty string leaves the rank name out. */
  rankName: string;
  /** Empty string, or an image that fails to load, leaves the rank art out. */
  rankImageSrc: string;
  logoSrc: string;
  /** Zero leaves the streak out. */
  streak: number;
  /** One entry per question, in the order they were answered. */
  results: ResultImageAnswer[];
};

const width = 1200;
const height = 900;
const margin = 40;
const contentLeft = 96;
const contentRight = width - contentLeft;
const contentWidth = contentRight - contentLeft;

const logoHeight = 72;
const logoAspect = 0.76;

const squaresPerRow = 5;
const squareGap = 20;
const squareSize =
  (contentWidth - squareGap * (squaresPerRow - 1)) / squaresPerRow;
const gridTop = 390;

/** Natural size of the front page avatars, used only if one reports none. */
const avatarSize = 256;
const avatarOpacity = 0.35;

/**
 * The shared image always looks the same, whatever the app is themed as. These
 * are the sRGB values of the dark theme tokens in tailwind.css, so the card
 * still matches the site people land on.
 */
const colors = {
  background: '#030712',
  card: '#101828',
  foreground: '#f9fafb',
  mutedForeground: '#99a1af',
  success: '#54bf5c',
  destructive: '#ff6a65',
  primary: '#ffbd29',
  border: 'rgba(255, 255, 255, 0.1)',
} as const;

/** `@fontsource-variable/dm-sans` registers the face under this exact name. */
const primaryFontFamily = '"DM Sans Variable"';
const fontFamily = `${primaryFontFamily}, sans-serif`;

/** The weights drawn below, so every face they need is fetched up front. */
const fontWeights = [400, 500, 600, 700, 800];
const fontLoadTimeoutMs = 3000;

/**
 * Fontsource splits the family into unicode ranges and only fetches a range
 * when the page renders text in it, so `document.fonts.ready` resolves happily
 * without ever pulling in a face nothing has asked for. Requesting the faces
 * explicitly is what makes the canvas draw in DM Sans instead of the platform
 * sans-serif. Bounded, because a font that never arrives must not leave the
 * share button stuck.
 */
const loadFonts = async (): Promise<void> => {
  const fonts = document.fonts;
  if (!fonts) {
    return;
  }

  try {
    await Promise.race([
      Promise.all(
        fontWeights.map((weight) =>
          fonts.load(`${weight} 40px ${primaryFontFamily}`),
        ),
      ),
      new Promise((resolve) => setTimeout(resolve, fontLoadTimeoutMs)),
    ]);
  } catch {
    // Drawing in the fallback font beats producing no image at all.
  }
};

const loadImage = (
  src: string,
  fallbackWidth: number,
  fallbackHeight: number,
): Promise<HTMLImageElement | null> => {
  if (!src) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const image = new Image();
    // Same origin needs no CORS, but asking for it means a cross-origin asset
    // without CORS headers fails to load instead of tainting the canvas, which
    // would make toBlob throw.
    image.crossOrigin = 'anonymous';
    // The logo svg only carries a viewBox, so give it explicit dimensions to
    // rasterise against.
    image.width = fallbackWidth;
    image.height = fallbackHeight;
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
};

const roundedRectPath = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  rectWidth: number,
  rectHeight: number,
  radius: number,
) => {
  context.beginPath();
  if (typeof context.roundRect === 'function') {
    context.roundRect(x, y, rectWidth, rectHeight, radius);
  } else {
    context.rect(x, y, rectWidth, rectHeight);
  }
};

/** Scales to fit inside the box while keeping the aspect ratio. */
const fitInside = (
  image: HTMLImageElement,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } => {
  const naturalWidth = image.naturalWidth || image.width || maxWidth;
  const naturalHeight = image.naturalHeight || image.height || maxHeight;
  const scale = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight, 1);
  return { width: naturalWidth * scale, height: naturalHeight * scale };
};

/** Scales to cover the square, keeping the aspect ratio and centring the crop. */
const drawCover = (
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  size: number,
) => {
  const naturalWidth = image.naturalWidth || size;
  const naturalHeight = image.naturalHeight || size;
  const scale = Math.max(size / naturalWidth, size / naturalHeight);
  const drawWidth = naturalWidth * scale;
  const drawHeight = naturalHeight * scale;
  context.drawImage(
    image,
    x + (size - drawWidth) / 2,
    y + (size - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
};

/** Loads each distinct character's avatar once. */
const loadAvatars = async (
  results: ResultImageAnswer[],
): Promise<Map<string, HTMLImageElement>> => {
  const names = [...new Set(results.map(({ characterName }) => characterName))];
  const images = await Promise.all(
    names.map((name) =>
      loadImage(getCharacterAvatarSrc(name) ?? '', avatarSize, avatarSize),
    ),
  );

  const byName = new Map<string, HTMLImageElement>();
  names.forEach((name, index) => {
    const image = images[index];
    if (image) {
      byName.set(name, image);
    }
  });
  return byName;
};

const toBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Could not turn the result card into an image'));
      }
    }, 'image/png');
  });

/** Renders the finished daily challenge as a shareable PNG. */
export const renderResultImage = async ({
  displayDate,
  score,
  totalQuestions,
  rankName,
  rankImageSrc,
  logoSrc,
  streak,
  results,
}: ResultImageInput): Promise<Blob> => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas is not available in this browser');
  }

  // Without this the render falls back to a system font.
  await loadFonts();

  const [logo, rankImage, avatars] = await Promise.all([
    loadImage(logoSrc, Math.round(logoHeight * logoAspect), logoHeight),
    loadImage(rankImageSrc, 380, 140),
    loadAvatars(results),
  ]);

  context.fillStyle = colors.background;
  context.fillRect(0, 0, width, height);

  roundedRectPath(
    context,
    margin,
    margin,
    width - margin * 2,
    height - margin * 2,
    36,
  );
  context.fillStyle = colors.card;
  context.fill();
  context.strokeStyle = colors.border;
  context.lineWidth = 2;
  context.stroke();

  // Header: logo, title, date, and the streak on the opposite side.
  let headerTextLeft = contentLeft;
  if (logo) {
    const logoWidth = logoHeight * logoAspect;
    context.drawImage(logo, contentLeft, 96, logoWidth, logoHeight);
    headerTextLeft = contentLeft + logoWidth + 20;
  }

  context.textBaseline = 'top';
  context.textAlign = 'left';
  context.fillStyle = colors.foreground;
  context.font = `700 40px ${fontFamily}`;
  context.fillText('TekkenDocs Daily Challenge', headerTextLeft, 98);

  context.fillStyle = colors.mutedForeground;
  context.font = `400 26px ${fontFamily}`;
  context.fillText(displayDate, headerTextLeft, 148);

  if (streak > 0) {
    context.textAlign = 'right';
    context.fillStyle = colors.foreground;
    context.font = `600 28px ${fontFamily}`;
    context.fillText(
      `🔥 ${streak} day${streak === 1 ? '' : 's'} streak`,
      contentRight,
      112,
    );
  }

  // Rank art, sitting opposite the score.
  if (rankImage) {
    const size = fitInside(rankImage, 380, 140);
    context.drawImage(
      rankImage,
      contentRight - size.width,
      265 - size.height / 2,
      size.width,
      size.height,
    );
  }

  // Score.
  context.textAlign = 'left';
  context.textBaseline = 'alphabetic';
  const scoreText = String(score);
  context.fillStyle = colors.primary;
  context.font = `800 96px ${fontFamily}`;
  context.fillText(scoreText, contentLeft, 300);

  const scoreWidth = context.measureText(scoreText).width;
  context.fillStyle = colors.mutedForeground;
  context.font = `600 44px ${fontFamily}`;
  context.fillText(`/ ${totalQuestions}`, contentLeft + scoreWidth + 16, 300);

  context.textBaseline = 'top';
  if (rankName) {
    context.fillStyle = colors.mutedForeground;
    context.font = `500 26px ${fontFamily}`;
    context.fillText(rankName, contentLeft, 320);
  }

  // Answer grid, each tile tinted by the result with the character faded in.
  results.forEach(({ isCorrect, characterName }, index) => {
    const x = contentLeft + (index % squaresPerRow) * (squareSize + squareGap);
    const y =
      gridTop + Math.floor(index / squaresPerRow) * (squareSize + squareGap);

    context.save();
    roundedRectPath(context, x, y, squareSize, squareSize, 28);
    context.clip();

    context.fillStyle = isCorrect ? colors.success : colors.destructive;
    context.fillRect(x, y, squareSize, squareSize);

    const avatar = avatars.get(characterName);
    if (avatar) {
      context.globalAlpha = avatarOpacity;
      drawCover(context, avatar, x, y, squareSize);
    }
    context.restore();
  });

  // Link, opposite corner from the logo.
  context.textAlign = 'right';
  context.fillStyle = colors.mutedForeground;
  context.font = `400 26px ${fontFamily}`;
  context.fillText(
    dailyChallengeShareUrl.replace(/^https?:\/\//, ''),
    contentRight,
    height - margin - 60,
  );

  return toBlob(canvas);
};

export const resultImageFileName = 'tekkendocs-daily-challenge.png';
