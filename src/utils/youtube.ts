const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'www.youtu.be',
  'music.youtube.com',
])

export function isYouTubeUrl(value: string): boolean {
  try {
    const parsed = new URL(value.trim())
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false
    if (!YOUTUBE_HOSTS.has(parsed.hostname)) return false

    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.length > 1
    }

    return (
      parsed.pathname === '/watch' ||
      parsed.pathname.startsWith('/shorts/') ||
      parsed.pathname.startsWith('/embed/') ||
      parsed.pathname.startsWith('/live/')
    )
  } catch {
    return false
  }
}

export function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return '—'

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  return `${minutes}:${String(seconds).padStart(2, '0')}`
}
