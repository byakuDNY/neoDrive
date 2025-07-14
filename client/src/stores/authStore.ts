import type { User } from '@/lib/types'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const session = ref<User | null>(null)
    const isAuthenticated = computed(() => !!session.value)

    const setSession = (user: User | null) => {
      session.value = user
    }
    const clearSession = () => {
      session.value = null
    }

    return {
      session,
      isAuthenticated,
      setSession,
      clearSession,
    }
  },
  {
    persist: true,
  },
)
