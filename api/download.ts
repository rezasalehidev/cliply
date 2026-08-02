import type { IncomingMessage, ServerResponse } from 'node:http'
import {
  isYouTubeUrl,
  sanitizeFilename,
  type DownloadType,
} from './_lib/youtube.js'

const COBALT_API = process.env.COBALT_API_URL || 'https://api.cobalt.tools/'

type Req = IncomingMessage & {
  method?: string
  query: Record<string, string | string[] | undefined>
}

type Res = ServerResponse & {
  status: (code: number) => Res
  json: (body: unknown) => void
  end: (chunk?: unknown) => void
  redirect: (code: number, url: string) => void
  setHeader: (name: string, value: string) => void
}

interface CobaltSuccess {
  status: 'tunnel' | 'redirect' | 'picker'
  url?: string
  filename?: string
  picker?: Array<{ type?: string; url?: string }>
}

interface CobaltError {
  status: 'error'
  error?: { code?: string; message?: string }
}

function queryString(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? ''
  return typeof value === 'string' ? value : ''
}

async function resolveCobaltDownload(
  url: string,
  type: DownloadType,
): Promise<{ downloadUrl: string; filename?: string }> {
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

  const data = (await response.json()) as CobaltSuccess | CobaltError

  if (!response.ok || data.status === 'error') {
    const message =
      (data as CobaltError).error?.message ||
      (data as CobaltError).error?.code ||
      `Download service failed (${response.status})`
    throw new Error(message)
  }

  if (data.status === 'picker') {
    const picked =
      data.picker?.find((item) => item.type === 'video' && item.url) ||
      data.picker?.find((item) => item.url)

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

export default async function handler(req: Req, res: Res) {
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed.' })
    return
  }

  const url = queryString(req.query.url).trim()
  const type = (queryString(req.query.type) || 'mp4') as DownloadType
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
