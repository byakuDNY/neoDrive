<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css'
</script>

<template>
  <Toaster position="top-center" rich-colors />
  <main>
    <RouterView />
  </main>
</template>
