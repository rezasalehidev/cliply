<script setup lang="ts">
import { Clock3, UserRound } from '@lucide/vue'
import type { VideoInfo } from '@/types/youtube'
import { formatDuration } from '@/utils/youtube'

defineProps<{
  video: VideoInfo
}>()
</script>

<template>
  <article class="overflow-hidden rounded-2xl border border-line bg-panel shadow-panel">
    <div class="aspect-video bg-slate-100">
      <img
        v-if="video.thumbnail"
        :src="video.thumbnail"
        :alt="video.title"
        class="h-full w-full object-cover"
        loading="lazy"
      />
    </div>

    <div class="space-y-3 p-5">
      <h2 class="font-display text-xl font-bold leading-snug text-ink sm:text-2xl">
        {{ video.title }}
      </h2>

      <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
        <span class="inline-flex items-center gap-1.5">
          <UserRound class="size-4" />
          {{ video.channel }}
        </span>
        <span class="inline-flex items-center gap-1.5">
          <Clock3 class="size-4" />
          {{ formatDuration(video.duration) }}
        </span>
      </div>
    </div>
  </article>
</template>
