/**
 * Guides write startup as "i10", "10", "15f" or "i10 ", and frame data as
 * "i13~14" or "i15, i23~24". Shows the first startup frame as "i10".
 */
export const formatStartup = (startup?: string) => {
  const trimmed = startup?.trim();
  if (!trimmed) return undefined;
  const frame = trimmed.match(/^i?(\d+)/i)?.[1];
  return frame ? `i${frame}` : trimmed;
};
