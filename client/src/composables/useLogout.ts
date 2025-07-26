import { useAuthStore } from '@/stores/authStore'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export const useLogout = () => {
  const router = useRouter()
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)

  const logout = async () => {
    isLoading.value = true
    errorMessage.value = null

    try {
      const response = await fetch(`/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })

      const data = await response.json()

      if (response.ok) {
        errorMessage.value = data.message ?? 'Logout failed'
      }

      const { clearSession } = useAuthStore()
      clearSession()

      router.push('/login')
    } catch (error) {
      errorMessage.value = 'Network error occurred'
      console.error('Logout error:', error)

      const { clearSession } = useAuthStore()
      clearSession()
      await router.push('/login')
    } finally {
      isLoading.value = false
    }
  }

  return {
    logout,
    isLoggingOut: isLoading,
    error: errorMessage,
  }
}
