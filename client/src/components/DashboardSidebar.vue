<script setup lang="ts">
import { mainNavigation, secondaryNavigation } from '@/lib/constants'
import { MenuIcon, XIcon } from 'lucide-vue-next'
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import AppLogo from './AppLogo.vue'
import { Button } from './ui/button'

const isCollapsed = ref(false)
const route = useRoute()

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

const isActiveRoute = (href: string) => {
  return route.path === href
}
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
    </div>
  </aside>
</template>
