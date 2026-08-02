const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'www.youtu.be',
  'music.youtube.com',
])

export function isYouTubeUrl(value) {
  try {
    const parsed = new URL(value)
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

export function sanitizeFilename(name) {
  return (
    String(name || '')
      .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 120) || 'cliply-download'
  )
}

export function mapInfoError(detail) {
  const text = String(detail || '')
  if (text.includes('Private video')) {
    return 'This video is private and cannot be downloaded.'
  }
  if (text.includes('Video unavailable') || text.includes('unavailable')) {
    return 'This video is unavailable.'
  }
  return 'Could not fetch video info. Check the link, your network, and try again.'
}
