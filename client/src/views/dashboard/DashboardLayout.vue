<script setup lang="ts">
import DashboardHeader from '@/components/DashboardHeader.vue'
import DashboardSidebar from '@/components/DashboardSidebar.vue'
import { useAuthStore } from '@/stores/auth'

const { session: user } = useAuthStore()
</script>

<template>
  <div class="flex">
    <DashboardSidebar />
    <div class="flex flex-col w-full">
      <DashboardHeader :user="user!" />
      <main>
        <RouterView />
      </main>
    </div>
  </div>
</template>
