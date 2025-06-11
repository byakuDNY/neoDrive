<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { RouterLink } from 'vue-router'
</script>

<template>
  <RouterLink
    to="/"
    class="flex items-center space-x-2 transition-transform duration-200 ease-in-out hover:scale-105"
  >
    <Icon icon="game-icons:overdrive" width="32" height="32" style="color: #05e17a"></Icon>
    <p class="text-xl font-bold">neo<span class="text-main">Drive</span></p>
  </RouterLink>
</template>
