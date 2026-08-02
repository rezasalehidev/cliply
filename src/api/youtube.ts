import type { DownloadType, VideoInfo } from '@/types/youtube'

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string }
    return data.error ?? `Request failed (${response.status})`
  } catch {
    return `Request failed (${response.status})`
  }
}

export async function fetchVideoInfo(url: string): Promise<VideoInfo> {
  const response = await fetch('/api/info', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  return (await response.json()) as VideoInfo
}

export function buildDownloadUrl(
  video: VideoInfo,
  type: DownloadType,
): string {
  const params = new URLSearchParams({
    url: video.url,
    type,
    title: video.title,
  })

  return `/api/download?${params.toString()}`
}
