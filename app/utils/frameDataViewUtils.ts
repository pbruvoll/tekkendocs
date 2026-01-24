// function which extract just the number from frame data, eg "i15~16, i30~32,i31~32" => "i15"
export const simplifyFrameValue = (frameData: string) => {
  return frameData.match(/i?[+-]?\d+/)?.[0] || '';
};

export const getHitFrameColorClasses = (
  frameValue: string | undefined,
): string => {
  if (!frameValue) {
    return 'text-muted-foreground';
  }

  const num = parseInt(frameValue, 10);
  if (Number.isNaN(num)) return 'text-foreground';
  if (num >= 10) return 'text-foreground-success';
  if (num < 0) return 'text-foreground-destructive';
  return 'text-foreground';
};

export const getBlockFrameColorClasses = (
  frameValue: string | undefined,
): string => {
  if (!frameValue) {
    return 'text-muted-foreground';
  }
  const num = parseInt(frameValue, 10);
  if (Number.isNaN(num)) return 'text-foreground';
  if (num > 0) return 'text-foreground-success';
  if (num <= -10) return 'text-foreground-destructive';
  return 'text-foreground';
};
