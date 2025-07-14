<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { LayoutDashboard, LogIn } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import AppLogo from './AppLogo.vue'
import ModeToggle from './ModeToggle.vue'
import { Button } from './ui/button'

const { showCallToAction = true } = defineProps<{
  showCallToAction?: boolean
}>()

const { isAuthenticated } = useAuthStore()
</script>

<template>
  <header class="fixed left-0 right-0 top-0 z-50 border-b-4 border-border bg-background">
    <div class="mx-auto flex h-16 max-w-7xl justify-between px-4 sm:px-6 lg:px-8">
      <AppLogo />

      <div class="space-x-4 flex items-center">
        <ModeToggle />
        <Button v-show="showCallToAction" asChild>
          <RouterLink v-if="isAuthenticated" to="/dashboard" class="flex items-center space-x-2">
            <LayoutDashboard />
            <span>Dashboard</span>
          </RouterLink>

          <RouterLink v-if="!isAuthenticated" to="/login" class="flex items-center space-x-2">
            <LogIn />
            <span>Login</span>
          </RouterLink>
        </Button>
      </div>
    </div>
  </header>
  <div class="h-16"></div>
</template>
