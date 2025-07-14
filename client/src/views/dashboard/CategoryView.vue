<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import ViewDetails from '@/components/ViewDetails.vue'
import type { FileCategory, SelectFile } from '@/lib/types'
import { formatFileSize } from '@/lib/utils'
import { useFileStore } from '@/stores/fileStore'
import { Download, Eye, Heart, Loader2, MoreHorizontal, Trash2, Upload } from 'lucide-vue-next'
import { computed, ref, type Component } from 'vue'
import { useRouter } from 'vue-router'

const { category, icon } = defineProps<{
  category: FileCategory | 'favorites'
  icon: Component
}>()

const router = useRouter()
const { getCategoryFiles, isPending, error, toggleFavorite } = useFileStore()

const selectedFile = ref<SelectFile | null>(null)
const showViewDetails = ref(false)
const showFilePreview = ref(false)
const categoryFiles = computed(() => getCategoryFiles(category))

const handleItemClick = (item: SelectFile) => {
  // Handle file click - show preview for media files
  if (
    item.mimeType?.startsWith('image/') ||
    item.mimeType?.startsWith('video/') ||
    item.mimeType?.startsWith('audio/')
  ) {
    selectedFile.value = item
    showFilePreview.value = true
  } else {
    // For other files, download directly
    handleDownload(item)
  }
}

const handleViewDetails = (item: SelectFile) => {
  selectedFile.value = item
  showViewDetails.value = true
}

const handleDownload = (item: any) => {
  if (item.url) {
    const link = document.createElement('a')
    link.href = item.url
    link.download = item.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

const handleDelete = (item: any) => {
  // Implement delete functionality
  console.log('Delete:', item.id)
}
</script>

<template>
  <section class="p-4 md:p-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div class="flex items-center space-x-4 mb-3">
        <div class="p-3 bg-background border-2 border-border rounded-base shadow-shadow">
          <component :is="icon" class="size-8 text-main" />
        </div>
        <div>
          <h1 class="text-2xl font-heading capitalize">{{ category }}</h1>
          <p>View all your {{ category === 'favorites' ? 'favorite' : category }} files</p>
          <p>{{ categoryFiles.length }} files</p>
        </div>
      </div>

      <Button @click="() => router.push('/dashboard')">
        <Upload />
        Upload
      </Button>
    </div>

    <!-- Content -->
    <section
      class="bg-background border-2 border-border rounded-base shadow-shadow overflow-hidden"
    >
      <!-- Loading State -->
      <section v-if="isPending" class="p-12 text-center space-y-2">
        <Loader2 class="animate-spin size-16 mx-auto" />
        <h2>Loading files...</h2>
      </section>

      <!-- Error State -->
      <section v-else-if="error" class="p-12 text-center space-y-2 text-red-500">
        <component :is="icon" class="size-16 mx-auto" />
        <h2>Error loading files</h2>
        <p>{{ error.message }}</p>
      </section>

      <!-- Empty State -->
      <section v-else-if="categoryFiles.length === 0" class="p-12 text-center space-y-2">
        <component :is="icon" class="size-16 mx-auto" />
        <h2>You don't have any {{ category === 'favorites' ? 'favorite' : category }} files</h2>
        <p>
          {{
            category === 'favorites'
              ? 'Mark some files as favorites to see them here'
              : `Upload some ${category} to get started`
          }}
        </p>
        <Button v-if="category !== 'favorites'" @click="() => router.push('/dashboard')">
          <Upload />
          Upload Files
        </Button>
      </section>

      <!-- Grid View -->
      <section
        v-else
        class="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4"
      >
        <div
          v-for="item in categoryFiles"
          :key="item.id"
          class="bg-background border-2 border-border rounded-base shadow-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 cursor-pointer group relative"
          @click="handleItemClick(item)"
        >
          <!-- 3 Dot Menu -->
          <div class="absolute top-2 right-2 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger @click="(e: Event) => e.stopPropagation()" as-child>
                <Button variant="neutral" class="size-6 p-0 cursor-pointer">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem @click="handleViewDetails(item)" class="cursor-pointer">
                  <Eye class="mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem @click="handleDownload(item)" class="cursor-pointer">
                  <Download class="mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem @click="toggleFavorite(item.id)" class="cursor-pointer">
                  <Heart class="mr-2" :class="{ 'fill-current text-red-500': item.isFavorited }" />
                  {{ item.isFavorited ? 'Remove from Favorites' : 'Add to Favorites' }}
                </DropdownMenuItem>
                <DropdownMenuItem @click="handleDelete(item)" class="text-red-500 cursor-pointer">
                  <Trash2 class="mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <!-- File Preview/Icon -->
          <div
            class="relative aspect-square p-4 flex items-center justify-center bg-secondary-background rounded-t-base overflow-hidden"
          >
            <!-- Image preview or File Icon -->
            <img
              v-if="item.mimeType?.startsWith('image/') && item.url"
              :src="item.url"
              :alt="item.name"
              class="w-full h-full object-cover"
            />
            <component v-else :is="item.icon" class="size-12 text-main" />
          </div>

          <!-- File Info -->
          <div class="p-3 space-y-2">
            <h3 class="font-base text-sm truncate" :title="item.name">
              {{ item.name }}
            </h3>
            <div class="flex justify-between items-center text-xs text-gray-500">
              <span>{{ formatFileSize(item.size) }}</span>
              <span>{{ new Date(item.updatedAt).toLocaleDateString() }}</span>
            </div>
          </div>
        </div>
      </section>
    </section>

    <!-- File Preview Dialog -->
    <Dialog v-model:open="showFilePreview">
      <DialogContent class="max-w-4xl max-h-[90vh] overflow-auto">
        <div v-if="selectedFile" class="space-y-4">
          <h3 class="text-lg font-semibold">{{ selectedFile.name }}</h3>

          <!-- Image Preview -->
          <div v-if="selectedFile.mimeType?.startsWith('image/')" class="flex justify-center">
            <img
              :src="selectedFile.url!"
              :alt="selectedFile.name"
              class="max-w-full max-h-[60vh] object-contain rounded-lg"
            />
          </div>

          <!-- Video Preview -->
          <div v-else-if="selectedFile.mimeType?.startsWith('video/')" class="flex justify-center">
            <video :src="selectedFile.url!" controls class="max-w-full max-h-[60vh] rounded-lg">
              Your browser does not support the video tag.
            </video>
          </div>

          <!-- Audio Preview -->
          <div v-else-if="selectedFile.mimeType?.startsWith('audio/')" class="flex justify-center">
            <audio :src="selectedFile.url!" controls class="w-full max-w-md">
              Your browser does not support the audio tag.
            </audio>
          </div>

          <div class="flex justify-between items-center pt-4 border-t">
            <div class="text-sm text-gray-500">
              {{ formatFileSize(selectedFile.size) }} •
              {{ new Date(selectedFile.updatedAt).toLocaleDateString() }}
            </div>
            <Button @click="handleDownload(selectedFile)">
              <Download class="mr-2" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <!-- View Details Dialog -->
    <Dialog v-model:open="showViewDetails">
      <DialogContent>
        <ViewDetails v-if="selectedFile" :file="selectedFile" />
      </DialogContent>
    </Dialog>
  </section>
</template>
