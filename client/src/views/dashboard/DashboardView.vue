<script setup lang="ts">
import CreateFolderDialog from '@/components/file/CreateFolderDialog.vue'
import FilePreviewDialog from '@/components/file/FilePreviewDialog.vue'
import RenameFileDialog from '@/components/file/RenameFileDialog.vue'
import UploadProgress from '@/components/file/UploadProgress.vue'
import ViewDetailsDialog from '@/components/file/ViewDetailsDialog.vue'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUpload } from '@/composables/useUpload'
import type { SelectFile } from '@/lib/types'
import { formatBytes } from '@/lib/utils'
import { useFileStore } from '@/stores/fileStore'
import {
  AlertCircle,
  ChevronRight,
  Download,
  EllipsisVertical,
  Eye,
  Folder,
  FolderPen,
  Heart,
  HomeIcon,
  Loader2,
  RefreshCcw,
  Trash2,
  Upload,
  X,
} from 'lucide-vue-next'
import { computed, ref } from 'vue'

const fileStore = useFileStore()
const {
  processUpload,
  isLoading,
  errorMessage: uploadError,
  uploads,
  showProgress,
  cancelUpload,
  dismissProgress,
  clearError,
  toggleProgress,
} = useUpload()

const currentPath = ref('/')
const selectedFile = ref<SelectFile | null>(null)
const showViewDetails = ref(false)
const showFilePreview = ref(false)
const showRenameDialog = ref(false)
const fileInputRef = ref<HTMLInputElement>()

const currentItems = computed(() => {
  const items = fileStore.getFilesByPath(currentPath.value)
  return items.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1
    }
    return a.name.localeCompare(b.name)
  })
})

const breadcrumbPath = computed(() => {
  if (currentPath.value === '/') return []

  const pathParts = currentPath.value.split('/').filter(Boolean)
  const breadcrumbs = []

  for (let i = 0; i < pathParts.length; i++) {
    const path = '/' + pathParts.slice(0, i + 1).join('/') + '/'
    const name = pathParts[i]
    breadcrumbs.push({ name, path })
  }

  return breadcrumbs
})

const createNewFolder = async (name: string) => {
  try {
    clearError()
    await processUpload(currentPath.value, 'folder', undefined, name)
  } catch (error) {
    console.error('Failed to create folder:', error)
    uploadError.value = error instanceof Error ? error.message : 'Failed to create folder'
  } finally {
    isLoading.value = false
  }
}

const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files

  if (files && files.length > 0) {
    try {
      clearError()
      await processUpload(currentPath.value, 'file', files)
    } catch (error) {
      console.error('Upload failed:', error)
      uploadError.value = error instanceof Error ? error.message : 'Failed to upload files'
    } finally {
      input.value = ''
      isLoading.value = false
    }
  }
}

const onFileSelect = (item: SelectFile) => {
  if (item.type === 'folder') {
    currentPath.value = item.path === '/' ? `/${item.name}/` : `${item.path}${item.name}/`
  } else {
    if (item.category === 'images' || item.category === 'videos' || item.category === 'audios') {
      selectedFile.value = item
      showFilePreview.value = true
    } else {
      window.open(item.url!, '_blank')
    }
  }
}

const openFileDetailsDialog = (item: SelectFile) => {
  selectedFile.value = item
  showViewDetails.value = true
}

const openRenameFileDialog = (item: SelectFile) => {
  selectedFile.value = item
  showRenameDialog.value = true
}

const onUploadButtonClick = () => {
  fileInputRef.value?.click()
}
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
        <Button @click="fileStore.refetch" variant="neutral">
          <RefreshCcw />
        </Button>

        <Button
          v-if="uploads.length > 0"
          @click="toggleProgress"
          variant="neutral"
          class="relative"
        >
          <Upload />
          <span
            class="absolute -top-1 -right-1 bg-main text-white rounded-full text-xs w-5 h-5 flex items-center justify-center"
          >
            {{ uploads.length }}
          </span>
        </Button>

        <CreateFolderDialog :is-loading="isLoading" @submit="createNewFolder" />
        <input
          ref="fileInputRef"
          type="file"
          multiple
          accept="*/*"
          @change="handleFileChange"
          class="hidden"
          :disabled="isLoading"
        />
        <Button @click="onUploadButtonClick" :disabled="isLoading" v-show="!isLoading">
          <Loader2 v-if="isLoading" class="animate-spin" />
          <Upload v-else />
          {{ isLoading ? 'Uploading...' : 'Upload Files' }}
        </Button>
      </div>
    </section>

    <!-- Upload Error Alert -->
    <div
      v-if="uploadError"
      class="mb-4 p-4 bg-secondary-background border-2 border-border rounded-base shadow-shadow flex items-center justify-between"
    >
      <div class="flex items-center text-red-500">
        <AlertCircle class="mr-2" />
        <span class="">{{ uploadError }}</span>
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
          <Button variant="neutral" class="m-1" @click="currentPath = '/'">root</Button>

          <div
            v-for="breadcrumb in breadcrumbPath"
            :key="breadcrumb.path"
            class="flex items-center flex-shrink-0"
          >
            <ChevronRight />
            <Button
              variant="neutral"
              @click="currentPath = breadcrumb.path"
              :title="breadcrumb.name"
              class="truncate max-w-[150px]"
            >
              {{ breadcrumb.name }}
            </Button>
          </div>
        </div>
      </nav>

      <!-- Loading State -->
      <section v-if="fileStore.isPending" class="p-12 text-center space-y-2">
        <Loader2 class="animate-spin size-16 mx-auto" />
        <h2>Loading files...</h2>
      </section>

      <!-- Error State -->
      <section v-else-if="fileStore.error" class="p-12 text-center space-y-2 text-red-500">
        <Folder class="size-16 mx-auto" />
        <h2>Error loading files</h2>
        <p>{{ fileStore.error.message }}</p>
      </section>

      <!-- Empty State -->
      <section v-else-if="currentItems.length === 0" class="p-12 text-center space-y-2">
        <Folder class="size-16 mx-auto" />
        <h2>You don't have any files</h2>
        <p>Upload some files to get started</p>
        <Button @click="onUploadButtonClick" :disabled="isLoading">
          <Loader2 v-if="isLoading" class="animate-spin" />
          <Upload v-else />
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
          @click="onFileSelect(item)"
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
              {{ formatBytes(item.size) }}
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
                <DropdownMenuItem v-if="item.type === 'file'" @click="openFileDetailsDialog(item)">
                  <Eye />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem @click="openRenameFileDialog(item)">
                  <FolderPen />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem v-if="item.type === 'file'" @click="fileStore.downloadFile(item)">
                  <Download />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem
                  v-if="item.type === 'file'"
                  @click="fileStore.toggleFavorite(item)"
                >
                  <Heart :class="{ 'fill-current text-red-500': item.isFavorited }" />
                  {{ item.isFavorited ? 'Remove from Favorites' : 'Add to Favorites' }}
                </DropdownMenuItem>
                <DropdownMenuItem @click="fileStore.removeFile(item)" class="text-red-500">
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
    <FilePreviewDialog
      :file="selectedFile"
      v-model:open="showFilePreview"
      @download="fileStore.downloadFile"
    />

    <!-- View Details Dialog -->
    <ViewDetailsDialog
      :file="selectedFile"
      v-model:open="showViewDetails"
      @download="fileStore.downloadFile"
    />

    <RenameFileDialog :file="selectedFile" v-model:open="showRenameDialog" />
  </section>
</template>
