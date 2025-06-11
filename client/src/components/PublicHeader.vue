<script setup lang="ts">
import { LayoutDashboard } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import AppLogo from './AppLogo.vue'
import ModeToggle from './ModeToggle.vue'
import { Button } from './ui/button'
</script>

<template>
  <header class="fixed left-0 right-0 top-0 z-50 border-b border-border bg-background">
    <div class="mx-auto flex h-16 max-w-7xl justify-between px-4 sm:px-6 lg:px-8">
      <AppLogo />

      <div class="hidden space-x-4 sm:ml-6 sm:flex sm:items-center">
        <ModeToggle />
        <Button asChild>
          <RouterLink to="/dashboard" class="flex items-center space-x-2">
            <LayoutDashboard class="h-4 w-4" />
            <span>Dashboard</span>
          </RouterLink>
        </Button>
      </div>
    </div>
  </header>
  <div class="h-16"></div>
</template>
