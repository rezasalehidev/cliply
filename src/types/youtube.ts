export type DownloadType = 'mp3' | 'mp4'

export interface VideoInfo {
  id: string
  title: string
  thumbnail: string
  duration: number
  channel: string
  url: string
}

export interface ApiError {
  error: string
}
