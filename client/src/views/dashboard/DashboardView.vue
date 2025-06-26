<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useLogout } from '@/composables/useLogout'
import { useAuthStore } from '@/stores/auth'

const { logout, isLoggingOut, error } = useLogout()

const handleLogout = async () => {
  await logout()
}

const { session } = useAuthStore()
</script>

<template>
  <div class="space-y-4 p-4">
    <h1>Dashboard View</h1>
    <div class="space-y-4">
      <div>
        <p>Logged in as {{ session!.name }}</p>
      </div>
    </div>
    <div>
      <Button @click="handleLogout" :disabled="isLoggingOut">
        {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
      </Button>

      <div v-if="error" class="error">
        {{ error }}
      </div>
    </div>
  </div>
</template>
