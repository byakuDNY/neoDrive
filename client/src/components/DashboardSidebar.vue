<script setup lang="ts">
import { mainNavigation, secondaryNavigation } from '@/lib/constants'
import { formatFileSize } from '@/lib/utils'
import { useBucketStore } from '@/stores/bucketStore'
import { AlertTriangle, HardDrive, MenuIcon, XIcon } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppLogo from './AppLogo.vue'
import { Button } from './ui/button'

const SIDEBAR_COLLAPSED_KEY = 'is-sidebar-collapsed'

const route = useRoute()
const isCollapsed = ref(true)
const bucketStore = useBucketStore()

onMounted(async () => {
  const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY)
  if (stored !== null) {
    isCollapsed.value = JSON.parse(stored)
  }

  await bucketStore.loadSubscriptionUsage()
})

watch(isCollapsed, (newValue) => {
  localStorage.setItem(SIDEBAR_COLLAPSED_KEY, JSON.stringify(newValue))
})

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  console.log(bucketStore.subscriptionUsage)
}

const isActiveRoute = (href: string) => {
  return route.path === href
}

const storagePercentage = computed(() => {
  return Number(bucketStore.storageUsagePercentage)
})

const isStorageWarning = computed(() => {
  return storagePercentage.value > 80
})

const isStorageCritical = computed(() => {
  return storagePercentage.value > 95
})
</script>

<template>
  <aside class="min-h-screen flex">
    <div
      class="bg-secondary-background border-border shadow-shadow transition-all duration-300 ease-in-out"
      :class="isCollapsed ? 'w-20' : 'w-64'"
    >
      <!-- Header -->
      <section class="p-4 border-b-4 border-border">
        <div v-if="!isCollapsed" class="flex items-center justify-between">
          <AppLogo />

          <Button @click="toggleSidebar" class="cursor-pointer">
            <XIcon />
          </Button>
        </div>

        <div v-if="isCollapsed">
          <Button @click="toggleSidebar" class="cursor-pointer">
            <MenuIcon />
          </Button>
        </div>
      </section>

      <!-- Navigation -->
      <section class="p-2 space-y-12">
        <!-- Main Navigation -->
        <section>
          <ul class="space-y-2">
            <li v-for="item in mainNavigation" :key="item.name">
              <RouterLink
                :to="item.href"
                class="flex items-center bg-background border-2 border-border rounded-base shadow-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 group font-heading"
                :class="[
                  isCollapsed ? 'p-2 justify-center' : 'p-3',
                  isActiveRoute(item.href) && 'bg-main text-background',
                ]"
              >
                <component
                  :is="item.icon"
                  class="transition-colors"
                  :class="!isActiveRoute(item.href) && 'group-hover:text-main'"
                />

                <span
                  v-if="!isCollapsed"
                  class="ml-3 transition-colors"
                  :class="!isActiveRoute(item.href) && 'group-hover:text-main'"
                >
                  {{ item.name }}
                </span>
              </RouterLink>
            </li>
          </ul>
        </section>

        <!-- Secondary Navigation -->
        <section>
          <ul class="space-y-2">
            <li v-for="item in secondaryNavigation" :key="item.name">
              <RouterLink
                :to="item.href"
                class="flex items-center bg-background border-2 border-border rounded-base shadow-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 group font-heading"
                :class="[
                  isCollapsed ? 'p-2 justify-center' : 'p-3',
                  isActiveRoute(item.href) && 'bg-main text-background',
                ]"
              >
                <component
                  :is="item.icon"
                  class="transition-colors"
                  :class="!isActiveRoute(item.href) && 'group-hover:text-main'"
                />
                <span
                  v-if="!isCollapsed"
                  class="ml-3 transition-colors"
                  :class="!isActiveRoute(item.href) && 'group-hover:text-main'"
                >
                  {{ item.name }}
                </span>
              </RouterLink>
            </li>
          </ul>
        </section>
      </section>

      <!-- Storage Section -->
      <section class="px-2 pt-40 border-border">
        <div
          v-if="bucketStore.subscriptionUsage"
          class="bg-background border-2 border-border rounded-base shadow-shadow p-3"
          :class="[
            isStorageCritical ? 'border-red-500' : isStorageWarning ? 'border-yellow-500' : '',
          ]"
        >
          <!-- Collapsed View -->
          <div v-if="isCollapsed" class="flex justify-center">
            <div class="relative">
              <HardDrive
                :class="[
                  isStorageCritical
                    ? 'text-red-500'
                    : isStorageWarning
                      ? 'text-yellow-500'
                      : 'text-main',
                ]"
              />
              <AlertTriangle
                v-if="isStorageWarning"
                class="absolute -top-1 -right-1 size-3 text-red-500"
              />
            </div>
          </div>

          <!-- Expanded View -->
          <div v-else class="space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <HardDrive
                  :class="[
                    isStorageCritical
                      ? 'text-red-500'
                      : isStorageWarning
                        ? 'text-yellow-500'
                        : 'text-main',
                  ]"
                />
                <span class="text-sm font-medium">Storage</span>
              </div>
              <AlertTriangle
                v-if="isStorageWarning"
                :class="isStorageCritical ? 'text-red-500' : 'text-yellow-500'"
              />
            </div>

            <!-- Progress Bar -->
            <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                class="h-2 rounded-full transition-all duration-300"
                :class="[
                  isStorageCritical ? 'bg-red-500' : isStorageWarning ? 'bg-yellow-500' : 'bg-main',
                ]"
                :style="{ width: `${Math.min(storagePercentage, 100)}%` }"
              ></div>
            </div>

            <!-- Storage Text -->
            <div class="text-xs text-foreground/70">
              <div class="flex justify-between items-center">
                <span>{{ formatFileSize(bucketStore.subscriptionUsage.usedStorage) }}</span>
                <span>{{ formatFileSize(bucketStore.subscriptionUsage.storageLimit) }}</span>
              </div>
              <div class="text-center mt-1">
                <span
                  class="font-medium"
                  :class="[
                    isStorageCritical
                      ? 'text-red-500'
                      : isStorageWarning
                        ? 'text-yellow-500'
                        : 'text-main',
                  ]"
                >
                  {{ bucketStore.subscriptionUsage.usagePercentage }}% used
                </span>
              </div>
            </div>

            <!-- Warning Message -->
            <div
              v-if="isStorageWarning"
              class="text-xs p-2 rounded-base"
              :class="isStorageCritical ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'"
            >
              <p v-if="isStorageCritical">⚠️ Storage almost full! Upgrade your plan.</p>
              <p v-else>📊 Storage running low. Consider upgrading.</p>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-else class="bg-background border-2 border-border rounded-base shadow-shadow p-3">
          <div v-if="isCollapsed" class="flex justify-center">
            <div class="size-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div v-else class="space-y-2">
            <div class="flex items-center gap-2">
              <div class="size-4 bg-gray-200 rounded animate-pulse"></div>
              <div class="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
            </div>
            <div class="h-2 bg-gray-200 rounded animate-pulse"></div>
            <div class="h-3 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </section>
    </div>
  </aside>
</template>
