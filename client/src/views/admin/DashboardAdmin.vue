<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const isLoading = ref(false)
const router = useRouter()

const login = async () => {
  try {
    const response = await fetch(`/api/auth/admin/logout`, {
      method: 'POST',
      credentials: 'include',
    })

    const data = await response.json()

    if (response.ok) {
      // errorMessage.value = data.message ?? 'Logout failed'
      console.error('Logout failed:', data.message)
    }

    const { clearAdminSession } = useAuthStore()
    clearAdminSession()

    router.push('/')
  } catch (error) {
    // errorMessage.value = 'Network error occurred'
    console.error('Logout error:', error)

    const { clearAdminSession } = useAuthStore()
    clearAdminSession()
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex justify-center items-center">
    <h1>Dashboard</h1>
    <Button @click="login" :disabled="isLoading">Logout</Button>
  </div>
</template>
