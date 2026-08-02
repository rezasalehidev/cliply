import { isYouTubeUrl, sanitizeFilename } from './_lib/youtube.js'

const COBALT_API = process.env.COBALT_API_URL || 'https://api.cobalt.tools/'

function queryString(value) {
  if (Array.isArray(value)) return value[0] || ''
  return typeof value === 'string' ? value : ''
}

async function resolveCobaltDownload(url, type) {
  const body =
    type === 'mp3'
      ? {
          url,
          downloadMode: 'audio',
          audioFormat: 'mp3',
          filenameStyle: 'pretty',
        }
      : {
          url,
          downloadMode: 'auto',
          videoQuality: '1080',
          filenameStyle: 'pretty',
        }

  const response = await fetch(COBALT_API, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = await response.json()

  if (!response.ok || data.status === 'error') {
    const message =
      data?.error?.message ||
      data?.error?.code ||
      `Download service failed (${response.status})`
    throw new Error(message)
  }

  if (data.status === 'picker') {
    const picked =
      (data.picker || []).find((item) => item.type === 'video' && item.url) ||
      (data.picker || []).find((item) => item.url)

    if (!picked?.url) {
      throw new Error('No downloadable stream was returned for this video.')
    }

    return { downloadUrl: picked.url, filename: data.filename }
  }

  if ((data.status === 'tunnel' || data.status === 'redirect') && data.url) {
    return { downloadUrl: data.url, filename: data.filename }
  }

  throw new Error('Unexpected response from download service.')
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed.' })
    return
  }

  const url = queryString(req.query.url).trim()
  const type = queryString(req.query.type) || 'mp4'
  const titleHint = sanitizeFilename(queryString(req.query.title) || 'cliply-download')

  if (!url || !isYouTubeUrl(url)) {
    res.status(400).json({ error: 'Please provide a valid YouTube URL.' })
    return
  }

  if (type !== 'mp3' && type !== 'mp4') {
    res.status(400).json({ error: 'Type must be mp3 or mp4.' })
    return
  }

  try {
    const { downloadUrl, filename } = await resolveCobaltDownload(url, type)
    const safeName = filename || `${titleHint}.${type === 'mp3' ? 'mp3' : 'mp4'}`

    if (queryString(req.query.mode) === 'redirect') {
      res.setHeader(
        'Content-Disposition',
        `attachment; filename*=UTF-8''${encodeURIComponent(safeName)}`,
      )
      res.redirect(302, downloadUrl)
      return
    }

    res.status(200).json({
      url: downloadUrl,
      filename: safeName,
      type,
    })
  } catch (error) {
    console.error('[api/download]', error)
    res.status(502).json({
      error:
        error instanceof Error
          ? error.message
          : 'Download failed. The video may be restricted or unavailable.',
    })
  }
}
