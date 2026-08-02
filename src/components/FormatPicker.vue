<script setup lang="ts">
import { Music2, Video } from '@lucide/vue'
import type { DownloadType } from '@/types/youtube'

defineProps<{
  modelValue: DownloadType
  disabled?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: DownloadType]
}>()
</script>

<template>
  <div class="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Download format">
    <button
      type="button"
      role="radio"
      class="flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition"
      :class="
        modelValue === 'mp4'
          ? 'border-accent bg-accent/5 text-accent-deep shadow-soft'
          : 'border-line bg-panel text-ink-soft hover:border-accent/30'
      "
      :aria-checked="modelValue === 'mp4'"
      :disabled="disabled"
      @click="$emit('update:modelValue', 'mp4')"
    >
      <Video class="size-5 shrink-0" />
      <span>
        <span class="block text-sm font-semibold">MP4</span>
        <span class="block text-xs text-muted">Video + audio</span>
      </span>
    </button>

    <button
      type="button"
      role="radio"
      class="flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition"
      :class="
        modelValue === 'mp3'
          ? 'border-accent bg-accent/5 text-accent-deep shadow-soft'
          : 'border-line bg-panel text-ink-soft hover:border-accent/30'
      "
      :aria-checked="modelValue === 'mp3'"
      :disabled="disabled"
      @click="$emit('update:modelValue', 'mp3')"
    >
      <Music2 class="size-5 shrink-0" />
      <span>
        <span class="block text-sm font-semibold">MP3</span>
        <span class="block text-xs text-muted">Audio only</span>
      </span>
    </button>
  </div>
</template>
