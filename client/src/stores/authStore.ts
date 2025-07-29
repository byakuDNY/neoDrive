import type { User } from '@/lib/types'
import { useFetch } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

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
      try {
        const userId = session.value?.id
        const { error, data: updatedName } = await useFetch(`/api/auth/me/${userId}`, {
          credentials: 'include',
        }).json()

        if (error.value) {
          clearSession()
          return
        }

        if (session.value) {
          setSession({
            ...session.value,
            name: updatedName.value,
          })
        }
      } catch (error) {
        console.error('Session check error:', error)
        clearSession()
      }
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
