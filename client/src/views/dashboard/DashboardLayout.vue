<script setup lang="ts">
import DashboardHeader from '@/components/DashboardHeader.vue'
import DashboardSidebar from '@/components/DashboardSidebar.vue'

const user = {
  name: 'John Doe',
  email: 'john@example.com',
  avatar:
    'https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80',
}
</script>

<template>
  <div class="flex">
    <DashboardSidebar />
    <div class="flex flex-col w-full">
      <DashboardHeader :user />
      <main>
        <RouterView />
      </main>
    </div>
  </div>
</template>
