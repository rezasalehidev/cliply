import cors from 'cors'
import express from 'express'
import { createReadStream, existsSync } from 'node:fs'
import { mkdir, readdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import ffmpegPath from 'ffmpeg-static'
import youtubeDl from 'youtube-dl-exec'
import {
  isYouTubeUrl,
  sanitizeFilename,
  type DownloadType,
  type VideoInfoResponse,
} from './youtube.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')
const DOWNLOADS_DIR = path.join(ROOT, 'downloads')
const PORT = Number(process.env.PORT) || 3001

const app = express()

app.use(cors({ origin: true }))
app.use(express.json({ limit: '16kb' }))

async function ensureDownloadsDir() {
  if (!existsSync(DOWNLOADS_DIR)) {
    await mkdir(DOWNLOADS_DIR, { recursive: true })
  }
}

function ffmpegFlags() {
  return ffmpegPath ? { ffmpegLocation: ffmpegPath } : {}
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'cliply-api' })
})

app.post('/api/info', async (req, res) => {
  const url = typeof req.body?.url === 'string' ? req.body.url.trim() : ''

  if (!url || !isYouTubeUrl(url)) {
    res.status(400).json({ error: 'Please provide a valid YouTube URL.' })
    return
  }

  try {
    const raw = (await youtubeDl(url, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      ...ffmpegFlags(),
    })) as Record<string, unknown>

    const payload: VideoInfoResponse = {
      id: String(raw.id ?? ''),
      title: String(raw.title ?? 'Untitled'),
      thumbnail: String(raw.thumbnail ?? ''),
      duration: Number(raw.duration ?? 0),
      channel: String(raw.channel ?? raw.uploader ?? 'Unknown'),
      url,
    }

    res.json(payload)
  } catch (error) {
    console.error('[info]', error)
    const detail =
      error && typeof error === 'object' && 'stderr' in error
        ? String((error as { stderr?: string }).stderr ?? '')
        : ''

    res.status(502).json({
      error: detail.includes('Private video')
        ? 'This video is private and cannot be downloaded.'
        : detail.includes('Video unavailable')
          ? 'This video is unavailable.'
          : 'Could not fetch video info. Check the link, your network, and try again.',
    })
  }
})

app.get('/api/download', async (req, res) => {
  const url = typeof req.query.url === 'string' ? req.query.url.trim() : ''
  const type = (typeof req.query.type === 'string' ? req.query.type : 'mp4') as DownloadType
  const titleHint =
    typeof req.query.title === 'string' ? sanitizeFilename(req.query.title) : 'cliply-download'

  if (!url || !isYouTubeUrl(url)) {
    res.status(400).json({ error: 'Please provide a valid YouTube URL.' })
    return
  }

  if (type !== 'mp3' && type !== 'mp4') {
    res.status(400).json({ error: 'Type must be mp3 or mp4.' })
    return
  }

  const jobId = randomUUID()
  const workDir = path.join(DOWNLOADS_DIR, jobId)

  try {
    await ensureDownloadsDir()
    await mkdir(workDir, { recursive: true })

    const outputTemplate = path.join(workDir, 'media.%(ext)s')

    if (type === 'mp3') {
      await youtubeDl(url, {
        output: outputTemplate,
        extractAudio: true,
        audioFormat: 'mp3',
        audioQuality: 0,
        noCheckCertificates: true,
        noWarnings: true,
        ...ffmpegFlags(),
      })
    } else {
      await youtubeDl(url, {
        output: outputTemplate,
        format: 'bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/b',
        mergeOutputFormat: 'mp4',
        noCheckCertificates: true,
        noWarnings: true,
        ...ffmpegFlags(),
      })
    }

    const files = await readdir(workDir)
    const mediaFile = files.find((name) => name.startsWith('media.'))

    if (!mediaFile) {
      throw new Error('Download finished but no media file was found.')
    }

    const filePath = path.join(workDir, mediaFile)
    const ext = path.extname(mediaFile).replace('.', '') || type
    const filename = `${titleHint}.${ext}`
    const contentType = type === 'mp3' ? 'audio/mpeg' : 'video/mp4'

    res.setHeader('Content-Type', contentType)
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    )

    const stream = createReadStream(filePath)
    stream.on('close', () => {
      void rm(workDir, { recursive: true, force: true })
    })
    stream.on('error', () => {
      void rm(workDir, { recursive: true, force: true })
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed while streaming the file.' })
      } else {
        res.end()
      }
    })
    stream.pipe(res)
  } catch (error) {
    console.error('[download]', error)
    await rm(workDir, { recursive: true, force: true }).catch(() => undefined)
    if (!res.headersSent) {
      res.status(502).json({
        error: 'Download failed. The video may be restricted or unavailable.',
      })
    }
  }
})

app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error('[unhandled]', err)
    res.status(500).json({ error: 'Unexpected server error.' })
  },
)

await ensureDownloadsDir()

app.listen(PORT, () => {
  console.log(`Cliply API listening on http://localhost:${PORT}`)
})
