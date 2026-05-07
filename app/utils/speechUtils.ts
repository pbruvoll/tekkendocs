export const normalizeSpeechText = (text: string) =>
  text.replace(/(?<=\d)\s*,\s*(?=\d)/g, ' ');
