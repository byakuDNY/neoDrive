<script setup lang="ts">
import { Button } from '@/components/ui/button'
import type { UploadItem } from '@/lib/types'
import { formatBytes } from '@/lib/utils'
import { CheckCircle, File, Loader2, X, XCircle } from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps<{
  uploads: UploadItem[]
  isVisible: boolean
}>()
const emit = defineEmits<{
  (e: 'cancel', id: string): void
  (e: 'dismiss'): void
}>()

const totalProgress = computed(() => {
  const totalPercent = props.uploads.reduce((sum, upload) => sum + upload.progress, 0)
  return Math.round(totalPercent / props.uploads.length)
})

const completedCount = computed(() => {
  return props.uploads.filter((upload) => upload.status === 'completed').length
})

const cancelledCount = computed(() => {
  return props.uploads.filter((upload) => upload.status === 'cancelled').length
})

const errorCount = computed(() => {
  return props.uploads.filter((upload) => upload.status === 'error').length
})

const isCompleted = computed(() => {
  return (
    props.uploads.length > 0 &&
    props.uploads.every(
      (upload) =>
        upload.status === 'completed' || upload.status === 'error' || upload.status === 'cancelled',
    )
  )
})

const handleCancel = (id: string) => {
  emit('cancel', id)
}

const handleDismiss = () => {
  emit('dismiss')
}
</script>

<template>
  <div
    v-if="isVisible && uploads.length > 0"
    class="bg-background border-2 border-border rounded-base shadow-shadow p-4 space-y-4"
  >
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <File />
        <h3 class="font-semibold">
          {{ isCompleted ? 'Upload Complete' : 'Uploading Files' }}
        </h3>
        <span class="text-sm text-gray-500"> ({{ completedCount }}/{{ uploads.length }}) </span>
      </div>
      <Button variant="neutral" size="sm" @click="handleDismiss">
        <X />
      </Button>
    </div>

    <!-- Overall Progress -->
    <div class="space-y-2">
      <span class="text-sm block">Overall Progress: {{ totalProgress }}%</span>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="h-2 rounded-full transition-all duration-300"
          :class="[isCompleted ? (errorCount > 0 ? 'bg-yellow-500' : 'bg-green-500') : 'bg-main']"
          :style="{ width: `${totalProgress}%` }"
        ></div>
      </div>
    </div>

    <!-- Individual File Progress -->
    <div class="space-y-2 max-h-48 overflow-y-auto">
      <div
        v-for="upload in uploads"
        :key="upload.id"
        class="flex items-center space-x-3 p-2 bg-secondary-background rounded-base"
      >
        <!-- Status Icon -->
        <div class="flex-shrink-0">
          <CheckCircle v-if="upload.status === 'completed'" class="text-green-500" />
          <XCircle v-else-if="upload.status === 'error'" class="text-red-500" />
          <X v-else-if="upload.status === 'cancelled'" class="text-yellow-500" />
          <Loader2 v-else class="animate-spin text-main" />
        </div>

        <!-- File Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium truncate">{{ upload.name }}</span>
            <span class="text-xs text-gray-500 ml-2">
              {{ formatBytes(upload.size) }}
            </span>
          </div>

          <!-- Progress Bar -->
          <div v-if="upload.status !== 'completed' && upload.status !== 'error'" class="mt-1">
            <div class="w-full bg-gray-200 rounded-full h-1">
              <div
                class="h-1 bg-main rounded-full transition-all duration-300"
                :style="{ width: `${upload.progress}%` }"
              ></div>
            </div>
            <div
              v-if="upload.status === 'pending' || upload.status === 'uploading'"
              class="flex justify-between text-xs text-gray-500 mt-1"
            >
              <span>{{ upload.status === 'pending' ? 'Waiting...' : 'Uploading...' }}</span>
              <span>{{ upload.progress }}%</span>
            </div>
          </div>

          <!-- Success Message -->
          <div v-if="upload.status === 'completed'" class="mt-1">
            <p class="text-xs text-green-500">Upload completed</p>
          </div>

          <!-- Error Message -->
          <div v-if="upload.status === 'error'" class="mt-1">
            <p class="text-xs text-red-500">{{ upload.error || 'Upload failed' }}</p>
          </div>

          <!-- Cancelled Message -->
          <div v-if="upload.status === 'cancelled'" class="mt-1">
            <p class="text-xs text-yellow-500">Upload cancelled</p>
          </div>
        </div>

        <!-- Cancel Button -->
        <Button
          v-if="upload.status === 'uploading' || upload.status === 'pending'"
          variant="neutral"
          size="sm"
          @click="handleCancel(upload.id)"
        >
          Cancel
        </Button>
      </div>
    </div>

    <!-- Summary -->
    <div v-if="isCompleted" class="pt-2 border-t border-gray-500">
      <div class="flex items-center justify-between text-sm">
        <span v-if="errorCount === 0 && cancelledCount === 0" class="text-green-500">
          All {{ uploads.length }} files uploaded successfully!
        </span>
        <span v-else class="text-red-500">
          {{ completedCount }} uploaded, {{ errorCount }} failed, {{ cancelledCount }} cancelled
        </span>
      </div>
    </div>
  </div>
</template>
