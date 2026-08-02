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

function triggerBrowserDownload(href: string, filename: string, external = false) {
  const anchor = document.createElement('a')
  anchor.href = href
  anchor.rel = 'noopener'
  if (external) {
    anchor.target = '_blank'
  } else {
    anchor.download = filename
  }
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}

export async function downloadMedia(
  video: VideoInfo,
  type: DownloadType,
): Promise<void> {
  const href = buildDownloadUrl(video, type)
  const response = await fetch(href)

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  const contentType = response.headers.get('content-type') || ''
  const safeTitle =
    video.title.replace(/[<>:"/\\|?*]/g, '').trim() || 'cliply-download'

  // Vercel serverless returns a direct media URL as JSON.
  if (contentType.includes('application/json')) {
    const data = (await response.json()) as {
      url?: string
      filename?: string
      error?: string
    }

    if (data.error || !data.url) {
      throw new Error(data.error || 'Download URL was missing.')
    }

    triggerBrowserDownload(data.url, data.filename || `${safeTitle}.${type}`, true)
    return
  }

  // Local Express streams the file bytes directly.
  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  triggerBrowserDownload(objectUrl, `${safeTitle}.${type}`)
  URL.revokeObjectURL(objectUrl)
}
