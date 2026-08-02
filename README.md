# Cliply

Paste a YouTube link and download it as **MP4** (video) or **MP3** (audio).

**Live demo:** [https://cliply-neon.vercel.app/](https://cliply-neon.vercel.app/)

Cliply is a Vue 3 app with API routes for video info and downloads. Paste a URL, preview the video, pick a format, and download.

> Use this only for media you own or have permission to download. Respect YouTube’s terms and copyright laws.

## Features

- YouTube URL validation (watch, Shorts, youtu.be, embeds)
- Video preview with title, channel, and thumbnail
- MP4 or MP3 download in one click
- Works locally and on Vercel

## Tech stack

| Layer | Tools |
| --- | --- |
| Frontend | Vue 3, TypeScript, Vite, Tailwind CSS v4, Vue Router |
| Local API | Express + yt-dlp (`youtube-dl-exec`) + ffmpeg-static |
| Vercel API | Serverless `/api` routes (oEmbed info + Cobalt download) |

Templates live in `.vue` files; logic lives in composables, utils, and API helpers.

## Getting started

### Requirements

- Node.js (LTS recommended)
- Yarn

### Install

```bash
yarn install
```

### Run locally (frontend + Express API)

```bash
yarn dev
```

- App: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:3001](http://localhost:3001)

### Other scripts

```bash
yarn build       # typecheck + production frontend build
yarn start       # Express API only
yarn dev:web     # Vite only
yarn dev:api     # Express API only
```

## How it works

1. The UI validates the YouTube URL and calls `POST /api/info`.
2. You choose **MP4** or **MP3**.
3. `GET /api/download` returns/streams the file.

On **Vercel**, `/api/*` is handled by serverless functions in the `api/` folder.  
Locally, Vite proxies `/api` to the Express server (yt-dlp).

Optional env on Vercel:

```bash
COBALT_API_URL=https://api.cobalt.tools/
```

## Project structure

```text
src/                 Vue app (pages, components, api client)
api/                 Vercel serverless routes
server/src/          Express API for local yt-dlp downloads
public/              Static assets
```

## Notes

- Local first run may take a moment while `youtube-dl-exec` prepares the yt-dlp binary.
- Local MP3 conversion uses the bundled `ffmpeg-static` binary.
- Temporary files for local downloads are written under `downloads/` and cleaned up after each request.
