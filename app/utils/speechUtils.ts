export const normalizeSpeechText = (text: string) =>
  text
    .replace(/(\d)\s*,\s*(\d)/g, '$1 $2')
    .replace(/,(?=\S)/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
