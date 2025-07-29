<script setup lang="ts">
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar.vue'
</script>

<template>
  <div class="flex">
    <DashboardSidebar />
    <div class="flex flex-col w-full">
      <DashboardHeader />
      <main>
        <RouterView />
      </main>
    </div>
  </div>
</template>
