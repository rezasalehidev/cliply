# Cliply

Vue 3 + Tailwind sample app: paste a YouTube URL and download **MP4** or **MP3**.

> For personal / educational use of media you own or have permission to download. Respect YouTube’s terms and copyright.

## Stack

- **Vue 3** + **TypeScript** (templates in `.vue`, logic in composables)
- **Vite** + **Tailwind CSS v4**
- **Express** API + **yt-dlp** (`youtube-dl-exec`) + **ffmpeg-static**

## Scripts

```bash
yarn install
yarn dev          # Vite (5173) + API (3001)
yarn build        # typecheck + production frontend build
yarn start        # API only
```

## How it works

1. Frontend validates the YouTube URL and calls `POST /api/info`.
2. User picks MP4 or MP3.
3. `GET /api/download` runs yt-dlp, then streams the file back to the browser.

## Notes

- First run may take a moment while `youtube-dl-exec` prepares the yt-dlp binary.
- Audio (MP3) conversion uses the bundled `ffmpeg-static` binary.
