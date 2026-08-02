<script setup lang="ts">
import { Download, LoaderCircle, Link2 } from '@lucide/vue'
import FormatPicker from '@/components/FormatPicker.vue'
import VideoPreview from '@/components/VideoPreview.vue'
import { useDownloader } from './composables'

const {
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
} = useDownloader()
</script>

<template>
  <main class="relative min-h-screen overflow-hidden">
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgb(20_184_166_/_0.18),_transparent_55%),linear-gradient(180deg,#eef6f5_0%,#f8fafc_42%,#f1f5f9_100%)]"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-accent-bright/20 blur-3xl"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute bottom-10 left-[-8%] h-64 w-64 rounded-full bg-slate-400/10 blur-3xl"
      aria-hidden="true"
    />

    <div class="container-page relative py-10 sm:py-16">
      <header class="mb-10 text-center sm:mb-12">
        <p class="mb-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          Cliply
        </p>
        <h1 class="mx-auto max-w-xl text-lg font-medium text-ink-soft sm:text-xl">
          Paste a YouTube link and download MP4 or MP3 in one step.
        </h1>
      </header>

      <section class="mx-auto max-w-2xl space-y-6">
        <form
          class="rounded-2xl border border-line/80 bg-panel/90 p-4 shadow-panel backdrop-blur sm:p-5"
          @submit.prevent="fetchInfo"
        >
          <label for="youtube-url" class="mb-2 block text-sm font-semibold text-ink-soft">
            YouTube URL
          </label>

          <div class="flex flex-col gap-3 sm:flex-row">
            <div class="relative flex-1">
              <Link2 class="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
              <input
                id="youtube-url"
                v-model="url"
                type="url"
                class="field pl-10"
                placeholder="https://www.youtube.com/watch?v=..."
                autocomplete="off"
                spellcheck="false"
                :disabled="loadingInfo || downloading"
              />
            </div>

            <button
              type="submit"
              class="btn btn-primary sm:min-w-36"
              :disabled="!canFetch || downloading"
            >
              <LoaderCircle v-if="loadingInfo" class="size-4 animate-spin" />
              <span>{{ loadingInfo ? 'Checking…' : 'Fetch' }}</span>
            </button>
          </div>
        </form>

        <p
          v-if="error"
          class="rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger"
          role="alert"
        >
          {{ error }}
        </p>

        <div v-if="video" class="space-y-5 animate-[fade-up_0.35s_ease]">
          <VideoPreview :video="video" />

          <div class="rounded-2xl border border-line bg-panel p-4 shadow-soft sm:p-5">
            <p class="mb-3 text-sm font-semibold text-ink-soft">Choose format</p>
            <FormatPicker v-model="selectedType" :disabled="downloading" />

            <div class="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                class="btn btn-primary flex-1"
                :disabled="!canDownload"
                @click="download"
              >
                <LoaderCircle v-if="downloading" class="size-4 animate-spin" />
                <Download v-else class="size-4" />
                <span>
                  {{
                    downloading
                      ? 'Preparing download…'
                      : `Download ${selectedType.toUpperCase()}`
                  }}
                </span>
              </button>

              <button
                type="button"
                class="btn btn-ghost"
                :disabled="downloading"
                @click="reset"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <p class="pt-2 text-center text-xs leading-relaxed text-muted">
          For personal use of content you own or have permission to download.
          Respect YouTube’s terms and copyright laws.
        </p>
      </section>
    </div>
  </main>
</template>

<style scoped>
@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
