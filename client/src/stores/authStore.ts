import type { User } from '@/lib/types'
import { useFetch } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const session = ref<User | null>(null)
    const adminSession = ref<{ name: string; role: string } | null>(null)

    const isAuthenticated = computed(() => !!session.value)
    const isAdminAuthenticated = computed(() => !!adminSession.value)

    const setSession = (user: User | null) => {
      session.value = user
    }

    const setAdminSession = (admin: { name: string; role: string } | null) => {
      adminSession.value = admin
    }

    const clearSession = () => {
      session.value = null
    }

    const clearAdminSession = () => {
      adminSession.value = null
    }

    const checkSession = async () => {
      const { error, data } = await useFetch(`/api/auth/me/${session.value?.id}`)
      if (error.value) {
        toast.error('Failed to check session', data.value.message)
        throw error.value
      }
      console.log(data.value)
      return data.value.data
    }

    return {
      session,
      adminSession,
      isAuthenticated,
      isAdminAuthenticated,
      setSession,
      setAdminSession,
      clearSession,
      clearAdminSession,
      checkSession,
    }
  },
  {
    persist: true,
  },
)
