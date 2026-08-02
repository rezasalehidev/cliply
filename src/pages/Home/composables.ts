import { computed, ref } from 'vue'
import { buildDownloadUrl, fetchVideoInfo } from '@/api/youtube'
import type { DownloadType, VideoInfo } from '@/types/youtube'
import { isYouTubeUrl } from '@/utils/youtube'

export function useDownloader() {
  const url = ref('')
  const video = ref<VideoInfo | null>(null)
  const selectedType = ref<DownloadType>('mp4')
  const loadingInfo = ref(false)
  const downloading = ref(false)
  const error = ref('')

  const canFetch = computed(() => isYouTubeUrl(url.value) && !loadingInfo.value)
  const canDownload = computed(() => Boolean(video.value) && !downloading.value)

  async function fetchInfo() {
    error.value = ''
    video.value = null

    const trimmed = url.value.trim()
    if (!isYouTubeUrl(trimmed)) {
      error.value = 'Paste a valid YouTube link (watch, shorts, or youtu.be).'
      return
    }

    loadingInfo.value = true
    try {
      video.value = await fetchVideoInfo(trimmed)
      url.value = trimmed
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load video info.'
    } finally {
      loadingInfo.value = false
    }
  }

  async function download() {
    if (!video.value) return

    error.value = ''
    downloading.value = true

    try {
      const href = buildDownloadUrl(video.value, selectedType.value)
      const response = await fetch(href)

      if (!response.ok) {
        let message = `Download failed (${response.status})`
        try {
          const data = (await response.json()) as { error?: string }
          if (data.error) message = data.error
        } catch {
          // response may be binary on success paths only
        }
        throw new Error(message)
      }

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      const extension = selectedType.value
      const safeTitle = video.value.title.replace(/[<>:"/\\|?*]/g, '').trim() || 'cliply-download'

      anchor.href = objectUrl
      anchor.download = `${safeTitle}.${extension}`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(objectUrl)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Download failed.'
    } finally {
      downloading.value = false
    }
  }

  function reset() {
    url.value = ''
    video.value = null
    selectedType.value = 'mp4'
    error.value = ''
    loadingInfo.value = false
    downloading.value = false
  }

  function clearError() {
    error.value = ''
  }

  return {
    url,
    video,
    selectedType,
    loadingInfo,
    downloading,
    error,
    canFetch,
    canDownload,
    fetchInfo,
    download,
    reset,
    clearError,
  }
}
