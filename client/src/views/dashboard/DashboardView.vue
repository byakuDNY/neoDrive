<script setup lang="ts">
import CreateFolderDialog from '@/components/CreateFolderDialog.vue'
import UploadProgress from '@/components/UploadProgress.vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import ViewDetails from '@/components/ViewDetails.vue'
import { useUpload } from '@/composables/useUpload'
import type { SelectFile } from '@/lib/types'
import { formatFileSize } from '@/lib/utils'
import { useFileStore } from '@/stores/fileStore'
import {
  ChevronRight,
  Download,
  EllipsisVertical,
  Eye,
  Folder,
  FolderPen,
  Heart,
  HomeIcon,
  Loader2,
  Trash2,
  Upload,
  AlertCircle,
  X,
  RefreshCcw,
} from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'

const { getFilesByPath, isPending, error: fileStoreError, toggleFavorite, refetch } = useFileStore()
const {
  handleUpload,
  isLoading,
  error: uploadError,
  uploads,
  showProgress,
  cancelUpload,
  dismissProgress,
  clearError,
} = useUpload()

const currentPath = ref('/')
const selectedFile = ref<SelectFile | null>(null)
const showViewDetails = ref(false)
const showFilePreview = ref(false)
const fileInputRef = ref<HTMLInputElement>()

// Get items for current path
const currentItems = computed(() => {
  const items = getFilesByPath(currentPath.value)

  return items.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1
    }
    return a.name.localeCompare(b.name)
  })
})

// Build breadcrumb path
const breadcrumbPath = computed(() => {
  if (currentPath.value === '/') return []

  const pathParts = currentPath.value.split('/').filter(Boolean)
  const breadcrumbs = []

  for (let i = 0; i < pathParts.length; i++) {
    const path = '/' + pathParts.slice(0, i + 1).join('/')
    const name = pathParts[i]
    breadcrumbs.push({ name, path })
  }

  return breadcrumbs
})

const handleNavigateHome = () => {
  currentPath.value = '/'
}

const handleNavigateToPath = (path: string) => {
  currentPath.value = path
}

const handleItemClick = (item: SelectFile) => {
  if (item.type === 'folder') {
    currentPath.value = item.path
  } else {
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
}

const handleCreateFolder = async (name: string) => {
  try {
    await handleUpload(currentPath.value, 'folder', undefined, name)
  } catch (error) {
    console.error('Failed to create folder:', error)
  }
}

const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files

  if (files && files.length > 0) {
    try {
      clearError()
      await handleUpload(currentPath.value, 'file', files)
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      input.value = ''
    }
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

const handleUploadClick = () => {
  fileInputRef.value?.click()
}

// Auto-clear error after 10 seconds
watch(uploadError, (newError) => {
  if (newError) {
    setTimeout(() => {
      clearError()
    }, 10000)
  }
})
</script>

<template>
  <section class="p-4 md:p-8">
    <!-- Header -->
    <section class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div class="flex items-center space-x-4 mb-3">
        <div class="p-3 bg-background border-2 border-border rounded-base shadow-shadow">
          <HomeIcon class="text-main size-8" />
        </div>
        <div>
          <h1 class="text-2xl font-heading">Dashboard</h1>
          <p>{{ 'View all your files and folders' }}</p>
          <p>{{ currentItems.length }} items</p>
        </div>
      </div>

      <div class="flex space-x-4">
        <Button @click="refetch">
          <RefreshCcw />
          Refetch</Button
        >
        <CreateFolderDialog :is-uploading="isLoading" @submit="handleCreateFolder" />
        <input
          ref="fileInputRef"
          type="file"
          multiple
          accept="*/*"
          @change="handleFileChange"
          class="hidden"
          :disabled="isLoading"
        />
        <Button @click="handleUploadClick" :disabled="isLoading">
          <Loader2 v-if="isLoading" />
          <Upload v-else />
          {{ isLoading ? 'Uploading...' : 'Upload Files' }}
        </Button>
      </div>
    </section>

    <!-- Error Alert -->
    <div
      v-if="uploadError"
      class="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-base shadow-shadow flex items-center justify-between"
    >
      <div class="flex items-center">
        <AlertCircle class="text-red-500" />
        <span class="text-red-700">{{ uploadError }}</span>
      </div>
      <Button variant="neutral" size="sm" @click="clearError">
        <X />
      </Button>
    </div>

    <!-- Upload Progress -->
    <div v-if="showProgress" class="mb-4">
      <UploadProgress
        :uploads="uploads"
        :is-visible="showProgress"
        @cancel="cancelUpload"
        @dismiss="dismissProgress"
      />
    </div>

    <!-- File Container -->
    <section
      class="bg-background border-2 border-border rounded-base shadow-shadow overflow-hidden"
    >
      <!-- Breadcrumb Navigation -->
      <nav class="border-b-2 border-border p-2">
        <div class="flex items-center space-x-2 overflow-x-auto">
          <Button variant="neutral" class="m-1" @click="handleNavigateHome">root</Button>

          <div
            v-for="breadcrumb in breadcrumbPath"
            :key="breadcrumb.path"
            class="flex items-center flex-shrink-0"
          >
            <ChevronRight />
            <Button
              variant="neutral"
              @click="handleNavigateToPath(breadcrumb.path)"
              :title="breadcrumb.name"
              class="truncate max-w-[150px]"
            >
              {{ breadcrumb.name }}
            </Button>
          </div>
        </div>
      </nav>

      <!-- Loading State -->
      <section v-if="isPending" class="p-12 text-center space-y-2">
        <Loader2 class="animate-spin size-16 mx-auto" />
        <h2>Loading files...</h2>
      </section>

      <!-- Error State -->
      <section v-else-if="fileStoreError" class="p-12 text-center space-y-2 text-red-500">
        <Folder class="size-16 mx-auto" />
        <h2>Error loading files</h2>
        <p>{{ fileStoreError.message }}</p>
      </section>

      <!-- Empty State -->
      <section v-else-if="currentItems.length === 0" class="p-12 text-center space-y-2">
        <Folder class="size-16 mx-auto" />
        <h2>You don't have any files</h2>
        <p>Upload some files to get started</p>
        <Button @click="handleUploadClick" :disabled="isLoading">
          <Upload />
          Upload Files
        </Button>
      </section>

      <!-- Files View -->
      <section v-else class="divide-y-2 divide-border">
        <!-- Header Row -->
        <div class="grid grid-cols-12 gap-4 p-4 bg-secondary-background">
          <div class="col-span-6 md:col-span-8 font-semibold">Name</div>
          <div class="col-span-3 md:col-span-2 text-center font-semibold">Size</div>
          <div class="col-span-3 md:col-span-2 text-center font-semibold">Actions</div>
        </div>

        <!-- File/Folder Rows -->
        <div
          v-for="item in currentItems"
          :key="item.id"
          class="grid grid-cols-12 gap-4 items-center p-4 hover:bg-main cursor-pointer transition-colors group"
          @click="handleItemClick(item)"
        >
          <!-- Name Column -->
          <div class="col-span-6 md:col-span-8 flex items-center">
            <div
              class="mr-4 p-2 bg-background border-2 border-border rounded-base shadow-shadow group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none transition-all duration-150"
            >
              <component
                :is="item.icon"
                class="size-4"
                :class="{ 'text-main': item.type === 'file' }"
              />
            </div>
            <span class="truncate font-base">{{ item.name }}</span>
          </div>

          <!-- Size Column -->
          <div class="col-span-3 md:col-span-2 text-center">
            <span v-if="item.type === 'file'" class="text-sm font-base">
              {{ formatFileSize(item.size) }}
            </span>
          </div>

          <!-- Actions Column -->
          <div class="col-span-3 md:col-span-2 flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger @click="(e: Event) => e.stopPropagation()" as-child>
                <Button variant="neutral" size="sm">
                  <EllipsisVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem v-if="item.type === 'file'" @click="handleViewDetails(item)">
                  <Eye />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem @click="">
                  <FolderPen />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem v-if="item.type === 'file'" @click="handleDownload(item)">
                  <Download />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem v-if="item.type === 'file'" @click="toggleFavorite(item.id)">
                  <Heart :class="{ 'fill-current text-red-500': item.isFavorited }" />
                  {{ item.isFavorited ? 'Remove from Favorites' : 'Add to Favorites' }}
                </DropdownMenuItem>
                <DropdownMenuItem @click="handleDelete(item)" class="text-red-500">
                  <Trash2 />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
              <Download />
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
