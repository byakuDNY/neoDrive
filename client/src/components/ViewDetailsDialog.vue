<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { SelectFile } from '@/lib/types'
import { convertBytesToFileSize, formattedDate } from '@/lib/utils'
import { Check, Copy, Download } from 'lucide-vue-next'
import { ref } from 'vue'

defineProps<{
  file: SelectFile | null
  open: boolean
}>()

defineEmits<{
  'update:open': [value: boolean]
  download: [file: SelectFile]
}>()

const copiedStates = ref<Record<string, boolean>>({})

const copyToClipboard = async (text: string, key: string) => {
  try {
    await navigator.clipboard.writeText(text)
    copiedStates.value[key] = true
    setTimeout(() => {
      copiedStates.value[key] = false
    }, 5000)
  } catch (err) {
    console.error('Failed to copy: ', err)
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle>File Details</DialogTitle>
      </DialogHeader>

      <div v-if="file" class="space-y-6">
        <!-- Header -->
        <div class="flex items-start space-x-4">
          <div class="p-3 bg-background border-2 border-border rounded-base shadow-shadow">
            <component :is="file.icon" class="size-8 text-main" />
          </div>
          <div class="flex-1">
            <h2 class="text-xl font-heading">{{ file.name }}</h2>
            <p class="text-gray-500 capitalize">{{ file.type }}</p>
          </div>
        </div>

        <!-- File Preview (if image) -->
        <div
          v-if="file.mimeType?.startsWith('image/') && file.url"
          class="border rounded-lg overflow-hidden"
        >
          <img :src="file.url" :alt="file.name" class="w-full max-h-48 object-cover" />
        </div>

        <!-- File Details -->
        <div class="space-y-4">
          <h3 class="font-semibold">File Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-500">Name</label>
              <div class="flex items-center space-x-2">
                <span class="text-sm bg-secondary-background px-2 py-1 rounded flex-1 break-all">{{
                  file.name
                }}</span>
                <Button
                  size="sm"
                  variant="neutral"
                  @click="copyToClipboard(file.name, 'name')"
                  :class="{ 'text-main': copiedStates.name }"
                >
                  <Check v-if="copiedStates.name" class="size-3" />
                  <Copy v-else class="size-3" />
                </Button>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-500">Size</label>
              <p class="text-sm">{{ convertBytesToFileSize(file.size) }}</p>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-500">MIME Type</label>
              <div class="flex items-center space-x-2">
                <span class="text-sm bg-secondary-background px-2 py-1 rounded flex-1 break-all">{{
                  file.mimeType
                }}</span>
                <Button
                  size="sm"
                  variant="neutral"
                  @click="copyToClipboard(file.mimeType!, 'mimeType')"
                  :class="{ 'text-main': copiedStates.mimeType }"
                >
                  <Check v-if="copiedStates.mimeType" class="size-3" />
                  <Copy v-else class="size-3" />
                </Button>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-500">Path</label>
              <div class="flex items-center space-x-2">
                <span class="text-sm bg-secondary-background px-2 py-1 rounded flex-1 break-all">{{
                  file.path
                }}</span>
                <Button
                  size="sm"
                  variant="neutral"
                  @click="copyToClipboard(file.path, 'path')"
                  :class="{ 'text-main': copiedStates.path }"
                >
                  <Check v-if="copiedStates.path" class="size-3" />
                  <Copy v-else class="size-3" />
                </Button>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-500">Created</label>
              <p class="text-sm">{{ formattedDate(file.createdAt) }}</p>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-500">Modified</label>
              <p class="text-sm">{{ formattedDate(file.updatedAt) }}</p>
            </div>
          </div>
        </div>

        <!-- Download -->
        <div class="pt-4 border-t">
          <Button @click="$emit('download', file)" class="w-full">
            <Download class="mr-2" />
            Download
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
