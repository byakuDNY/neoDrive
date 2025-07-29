<script setup lang="ts">
import FilePreviewDialog from '@/components/file/FilePreviewDialog.vue'
import RenameFileDialog from '@/components/file/RenameFileDialog.vue'
import ViewDetailsDialog from '@/components/file/ViewDetailsDialog.vue'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { FileCategory, SelectFile } from '@/lib/types'
import { formatBytes } from '@/lib/utils'
import { useFileStore } from '@/stores/fileStore'
import {
  Download,
  Eye,
  FolderPen,
  Grid3X3,
  Heart,
  List,
  Loader2,
  MoreHorizontal,
  Trash2,
} from 'lucide-vue-next'
import { computed, ref, watch, type Component } from 'vue'

const { category, icon } = defineProps<{
  category: FileCategory | 'favorites'
  icon: Component
}>()

const fileStore = useFileStore()

const selectedFile = ref<SelectFile | null>(null)
const showViewDetails = ref(false)
const showFilePreview = ref(false)
const showRenameDialog = ref(false)

// View and sort state with localStorage persistence
const viewMode = ref<'grid' | 'list'>(
  (localStorage.getItem('fileView-viewMode') as 'grid' | 'list') || 'list',
)
const sortBy = ref<'name' | 'size' | 'updatedAt'>(
  (localStorage.getItem('fileView-sortBy') as 'name' | 'size' | 'updatedAt') || 'name',
)
const sortOrder = ref<'asc' | 'desc'>(
  (localStorage.getItem('fileView-sortOrder') as 'asc' | 'desc') || 'asc',
)

// Watch for changes and save to localStorage
watch(viewMode, (newValue) => {
  localStorage.setItem('fileView-viewMode', newValue)
})

watch(sortBy, (newValue) => {
  localStorage.setItem('fileView-sortBy', newValue)
})

watch(sortOrder, (newValue) => {
  localStorage.setItem('fileView-sortOrder', newValue)
})

const categoryFiles = computed(() => {
  const files = fileStore.getCategoryFiles(category)

  // Sort files
  const sortedFiles = [...files].sort((a, b) => {
    let comparison = 0

    switch (sortBy.value) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'size':
        comparison = a.size - b.size
        break
      case 'updatedAt':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        break
    }

    return sortOrder.value === 'asc' ? comparison : -comparison
  })

  return sortedFiles
})

const handleItemClick = (item: SelectFile) => {
  if (item.category === 'images' || item.category === 'videos' || item.category === 'audios') {
    selectedFile.value = item
    showFilePreview.value = true
  } else {
    window.open(item.url!, '_blank')
  }
}

const handleViewDetails = (item: SelectFile) => {
  selectedFile.value = item
  showViewDetails.value = true
}

const handleRename = (item: SelectFile) => {
  selectedFile.value = item
  showRenameDialog.value = true
}

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
}

const getSortLabel = (value: string) => {
  const labels = {
    name: 'Name',
    size: 'Size',
    updatedAt: 'Last Modified',
  }
  return labels[value as keyof typeof labels]
}
</script>

<template>
  <section class="p-4 md:p-8">
    <!-- Header -->
    <div class="flex items-center space-x-4 mb-3">
      <div class="p-3 bg-background border-2 border-border rounded-base shadow-shadow">
        <component :is="icon" class="size-8 text-main" />
      </div>
      <div class="flex items-center justify-between w-full">
        <div>
          <h1 class="text-2xl font-heading capitalize">{{ category }}</h1>
          <p>View all your {{ category === 'favorites' ? 'favorite' : category }} files</p>
          <p>{{ categoryFiles.length }} files</p>
        </div>
        <div class="flex flex-col gap-2">
          <!-- View Toggle -->
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium">View:</span>
            <div class="flex border-2 border-border rounded-base overflow-hidden">
              <Button
                variant="noShadow"
                :class="viewMode === 'list' ? 'bg-main text-white' : 'bg-background'"
                class="rounded-none border-0 px-3 py-1"
                @click="viewMode = 'list'"
              >
                <List class="size-4" />
              </Button>
              <Button
                variant="noShadow"
                :class="viewMode === 'grid' ? 'bg-main text-white' : 'bg-background'"
                class="rounded-none border-0 px-3 py-1"
                @click="viewMode = 'grid'"
              >
                <Grid3X3 class="size-4" />
              </Button>
            </div>
          </div>

          <!-- Sort Controls -->
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium">Sort by:</span>
            <Select v-model="sortBy">
              <SelectTrigger class="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="size">Size</SelectItem>
                <SelectItem value="updatedAt">Last Modified</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="neutral" size="sm" @click="toggleSortOrder" class="px-2">
              {{ sortOrder === 'asc' ? '↑' : '↓' }}
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <section
      class="bg-background border-2 border-border rounded-base shadow-shadow overflow-hidden"
    >
      <!-- Loading State -->
      <section v-if="fileStore.isPending" class="p-12 text-center space-y-2">
        <Loader2 class="animate-spin size-16 mx-auto" />
        <h2>Loading files...</h2>
      </section>

      <!-- Error State -->
      <section v-else-if="fileStore.error" class="p-12 text-center space-y-2 text-red-500">
        <component :is="icon" class="size-16 mx-auto" />
        <h2>Error loading files</h2>
        <p>{{ fileStore.error.message }}</p>
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
      </section>

      <!-- List View -->
      <section v-else-if="viewMode === 'list'" class="divide-y divide-border">
        <div
          v-for="item in categoryFiles"
          :key="item.id"
          class="flex items-center p-4 hover:bg-secondary-background cursor-pointer group"
          @click="handleItemClick(item)"
        >
          <!-- File Icon/Preview -->
          <div class="flex-shrink-0 w-10 h-10 mr-4 flex items-center justify-center">
            <img
              v-if="item.mimeType?.startsWith('image/') && item.url"
              :src="item.url"
              :alt="item.name"
              class="w-full h-full object-cover rounded"
            />
            <component v-else :is="item.icon" class="size-6 text-main" />
          </div>

          <!-- File Info -->
          <div class="flex-grow min-w-0">
            <h3 class="font-medium text-sm truncate" :title="item.name">
              {{ item.name }}
            </h3>
            <div class="flex items-center space-x-4 text-xs text-gray-500 mt-1">
              <span>{{ formatBytes(item.size) }}</span>
              <span>{{ new Date(item.updatedAt).toLocaleDateString() }}</span>
            </div>
          </div>

          <!-- Favorite Status -->
          <div class="flex-shrink-0 mx-4">
            <Heart v-if="item.isFavorited" class="size-4 fill-current text-red-500" />
          </div>

          <!-- Actions Menu -->
          <div class="flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger @click="(e: Event) => e.stopPropagation()" as-child>
                <Button
                  variant="neutral"
                  class="size-8 p-0 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal class="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem @click="handleViewDetails(item)" class="cursor-pointer">
                  <Eye class="mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem @click="handleRename(item)">
                  <FolderPen />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem @click="fileStore.downloadFile(item)" class="cursor-pointer">
                  <Download class="mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem @click="fileStore.toggleFavorite(item)" class="cursor-pointer">
                  <Heart class="mr-2" :class="{ 'fill-current text-red-500': item.isFavorited }" />
                  {{ item.isFavorited ? 'Remove from Favorites' : 'Add to Favorites' }}
                </DropdownMenuItem>
                <DropdownMenuItem
                  @click="fileStore.removeFile(item)"
                  class="text-red-500 cursor-pointer"
                >
                  <Trash2 class="mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
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
                <DropdownMenuItem @click="handleRename(item)">
                  <FolderPen />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem @click="fileStore.downloadFile(item)" class="cursor-pointer">
                  <Download class="mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem @click="fileStore.toggleFavorite(item)" class="cursor-pointer">
                  <Heart class="mr-2" :class="{ 'fill-current text-red-500': item.isFavorited }" />
                  {{ item.isFavorited ? 'Remove from Favorites' : 'Add to Favorites' }}
                </DropdownMenuItem>
                <DropdownMenuItem
                  @click="fileStore.removeFile(item)"
                  class="text-red-500 cursor-pointer"
                >
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
              <span>{{ formatBytes(item.size) }}</span>
              <span>{{ new Date(item.updatedAt).toLocaleDateString() }}</span>
            </div>
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
