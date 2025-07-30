<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLogout } from '@/composables/useLogout'
import type { SelectFile } from '@/lib/types'
import { useAuthStore } from '@/stores/authStore'
import { useFileStore } from '@/stores/fileStore'
import Fuse from 'fuse.js'
import { LogOut, Search, X } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import ModeToggle from '../ModeToggle.vue'
import { Avatar, AvatarImage } from '../ui/avatar'
import { Input } from '../ui/input'

const router = useRouter()

const authStore = useAuthStore()
const fileStore = useFileStore()
const { logout } = useLogout()

const session = computed(() => authStore.session)
const searchQuery = ref('')
const searchResults = ref<SelectFile[]>([])
const showSuggestions = ref(false)
const searchInputRef = ref<HTMLInputElement>()

// Configure Fuse.js for fuzzy searching
const fuseOptions = {
  keys: ['name', 'path', 'mimeType'],
  threshold: 0.3,
  includeScore: true,
  minMatchCharLength: 2,
}

const fuse = computed(() => {
  return new Fuse(
    fileStore.allFiles.filter((file) => file.type === 'file'),
    fuseOptions,
  )
})

// Watch for search query changes
watch(searchQuery, (newQuery) => {
  if (newQuery.trim().length === 0) {
    searchResults.value = []
    showSuggestions.value = false
    return
  }

  if (newQuery.trim().length >= 1) {
    const results = fuse.value.search(newQuery)
    searchResults.value = results.map((result) => result.item).slice(0, 8) // Limit to 8 results
    showSuggestions.value = true
  }
})

const openFile = (item: SelectFile) => {
  if (item.url) {
    window.open(item.url, '_blank')
  }
  clearSearch()
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  showSuggestions.value = false
}
</script>

<template>
  <header class="border-b-4">
    <div class="flex justify-between p-4 space-x-2">
      <div></div>

      <div class="relative max-w-60 lg:max-w-96">
        <div class="relative">
          <Search
            class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"
          />
          <Input
            ref="searchInputRef"
            v-model="searchQuery"
            placeholder="Search all files..."
            class="pl-10"
            @focus="showSuggestions = searchQuery.length >= 2 && searchResults.length > 0"
          />
          <X
            v-if="showSuggestions"
            @click="clearSearch"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
        </div>

        <!-- Search Suggestions -->
        <div
          v-if="showSuggestions && searchResults.length > 0"
          class="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-80 overflow-y-auto w-96 lg:w-[40rem]"
        >
          <div class="p-2">
            <div class="text-xs text-gray-500 mb-2 px-2">{{ searchResults.length }} results</div>
            <div
              v-for="item in searchResults"
              :key="item.id"
              class="flex items-center gap-3 p-2 hover:bg-main rounded-sm cursor-pointer group"
              @click="openFile(item)"
            >
              <component :is="item.icon" class="size-4 text-gray-500 flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium truncate">{{ item.name }}</div>
                <div class="text-xs text-gray-500 truncate">
                  {{ item.path === '/' ? 'Root' : item.path }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- No Results -->
        <div
          v-else-if="showSuggestions && searchQuery.length >= 1 && searchResults.length === 0"
          class="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50"
        >
          <div class="p-4 text-center text-sm text-muted-foreground">
            No files found for "{{ searchQuery }}"
          </div>
        </div>
      </div>

      <div class="space-x-4 flex items-center">
        <ModeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger class="cursor-pointer" as-child>
            <Avatar class="size-10">
              <AvatarImage src="/profile.svg" alt="User avatar" class="object-cover" />
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-56" align="end">
            <DropdownMenuLabel>
              <div class="flex items-center gap-2 px-1 py-1.5">
                <Avatar class="size-8 overflow-hidden rounded-full">
                  <AvatarImage src="/profile.svg" alt="User avatar" class="object-cover" />
                </Avatar>
                <div class="flex flex-col text-left">
                  <span class="truncate text-base font-medium">{{ session?.name }}</span>
                  <span class="truncate text-xs">{{ session?.email }}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="router.push('/dashboard/profile')">
              <span>Profile</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem @click="logout">
              <LogOut className="mr-2" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </header>
</template>
