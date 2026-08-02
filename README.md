# Cliply

Paste a YouTube link and download it as **MP4** (video) or **MP3** (audio).

Cliply is a small Vue 3 app with a local API. You drop in a URL, preview the video, pick a format, and download the file.

> Use this only for media you own or have permission to download. Respect YouTube’s terms and copyright laws.

## Features

- YouTube URL validation (watch, Shorts, youtu.be, embeds)
- Video preview with title, channel, and duration
- MP4 or MP3 download in one click
- Clean Vue 3 UI with Tailwind CSS

## Tech stack

| Layer | Tools |
| --- | --- |
| Frontend | Vue 3, TypeScript, Vite, Tailwind CSS v4, Vue Router |
| Backend | Express, yt-dlp (`youtube-dl-exec`), ffmpeg-static |

Templates live in `.vue` files; logic lives in composables, utils, and API helpers.

## Getting started

### Requirements

- Node.js (LTS recommended)
- Yarn

### Install

```bash
yarn install
```

### Run (frontend + API)

```bash
yarn dev
```

- App: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:3001](http://localhost:3001)

### Other scripts

```bash
yarn build       # typecheck + production frontend build
yarn start       # API only
yarn dev:web     # Vite only
yarn dev:api     # API only
```

## How it works

1. The UI validates the YouTube URL and calls `POST /api/info`.
2. You choose **MP4** or **MP3**.
3. `GET /api/download` runs yt-dlp, then streams the file back to the browser.

## Project structure

```text
src/                 Vue app (pages, components, api client)
server/src/          Express API for info + download
public/              Static assets
```

## Notes

- The first run may take a moment while `youtube-dl-exec` prepares the yt-dlp binary.
- MP3 conversion uses the bundled `ffmpeg-static` binary.
- Temporary files are written under `downloads/` and cleaned up after each download.
