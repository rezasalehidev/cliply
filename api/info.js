import { isYouTubeUrl, mapInfoError } from './_lib/youtube.js'

function readBodyUrl(req) {
  if (typeof req.body === 'string') {
    try {
      const parsed = JSON.parse(req.body)
      return typeof parsed.url === 'string' ? parsed.url.trim() : ''
    } catch {
      return ''
    }
  }

  if (req.body && typeof req.body === 'object' && typeof req.body.url === 'string') {
    return req.body.url.trim()
  }

  return ''
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' })
    return
  }

  const url = readBodyUrl(req)

  if (!url || !isYouTubeUrl(url)) {
    res.status(400).json({ error: 'Please provide a valid YouTube URL.' })
    return
  }

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    const response = await fetch(oembedUrl, {
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      throw new Error(
        response.status === 404 ? 'Video unavailable' : `oEmbed failed (${response.status})`,
      )
    }

    const data = await response.json()

    const idMatch =
      url.match(/[?&]v=([^&]+)/)?.[1] ||
      url.match(/youtu\.be\/([^?&/]+)/)?.[1] ||
      url.match(/\/shorts\/([^?&/]+)/)?.[1] ||
      url.match(/\/embed\/([^?&/]+)/)?.[1] ||
      ''

    res.status(200).json({
      id: idMatch,
      title: data.title || 'Untitled',
      thumbnail: data.thumbnail_url || '',
      duration: 0,
      channel: data.author_name || 'Unknown',
      url,
    })
  } catch (error) {
    console.error('[api/info]', error)
    const detail = error instanceof Error ? error.message : String(error)
    res.status(502).json({ error: mapInfoError(detail) })
  }
}
