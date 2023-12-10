export type MatchVideoSet = {
  videos: MatchVideo[]
  setName: string
}

export type MatchVideo = {
  url: string
  name: string
  type: string
  description: string
  result: string
  characters: string
  thumbnail: string
  date: Date
}
