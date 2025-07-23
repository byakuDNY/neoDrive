<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import type { SelectFile } from '@/lib/types'
import { convertBytesToFileSize } from '@/lib/utils'
import { Download } from 'lucide-vue-next'

defineProps<{
  file: SelectFile | null
  open: boolean
}>()

defineEmits<{
  'update:open': [value: boolean]
  download: [file: SelectFile]
}>()
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-4xl max-h-[90vh] overflow-auto">
      <div v-if="file" class="space-y-4">
        <h3 class="text-lg font-semibold">{{ file.name }}</h3>

        <!-- Image Preview -->
        <div v-if="file.mimeType?.startsWith('image/')" class="flex justify-center">
          <img
            :src="file.url!"
            :alt="file.name"
            class="max-w-full max-h-[60vh] object-contain rounded-lg"
          />
        </div>

        <!-- Video Preview -->
        <div v-else-if="file.mimeType?.startsWith('video/')" class="flex justify-center">
          <video :src="file.url!" controls class="max-w-full max-h-[60vh] rounded-lg">
            Your browser does not support the video tag.
          </video>
        </div>

        <!-- Audio Preview -->
        <div v-else-if="file.mimeType?.startsWith('audio/')" class="flex justify-center">
          <audio :src="file.url!" controls class="w-full max-w-md">
            Your browser does not support the audio tag.
          </audio>
        </div>

        <!-- File info and actions -->
        <div class="flex justify-between items-center pt-4 border-t">
          <div class="text-sm text-gray-500">
            {{ convertBytesToFileSize(file.size) }} •
            {{ new Date(file.updatedAt).toLocaleDateString() }}
          </div>
          <Button @click="$emit('download', file)">
            <Download class="mr-2" />
            Download
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
