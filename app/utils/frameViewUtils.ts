// function which extract just the number from frame data, eg "i15~16, i30~32,i31~32" => "i15"
export const simplifyFrameValue = (frameData: string) => {
  return frameData.match(/i?[+-]?\d+/)?.[0] || '';
};