export const getCacheControlHeaders = ({ seconds }: { seconds: number }) => {
  return {
    'Cache-Control': `public, max-age=${seconds}, s-maxage=${seconds}`,
  }
}
