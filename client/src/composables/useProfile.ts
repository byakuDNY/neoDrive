import { useAuthStore } from '@/stores/authStore'
import { ref } from 'vue'
import { toast } from 'vue-sonner'

export const useProfile = () => {
  const authStore = useAuthStore()

  const isChangingName = ref(false)
  const isChangingPassword = ref(false)
  const nameError = ref<string | null>(null)
  const passwordError = ref<string | null>(null)

  const changeName = async (newName: string) => {
    if (!authStore.session) {
      nameError.value = 'User session not found'
      return false
    }

    nameError.value = null
    isChangingName.value = true

    try {
      const response = await fetch('/api/user/name', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: newName, userId: authStore.session.id }),
      })

      const { message, data } = await response.json()

      if (!response.ok) {
        nameError.value = message || 'Failed to change name'
        toast.error(nameError.value)
        return false
      }

      // Update session with new user data
      authStore.setSession({ ...authStore.session, name: data.name })
      toast.success(message)
      return true
    } catch (error) {
      nameError.value = 'Network error occurred'
      toast.error(nameError.value)
      console.error('Name change error:', error)
      return false
    } finally {
      isChangingName.value = false
    }
  }

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
    confirmNewPassword: string,
  ) => {
    if (!authStore.session) {
      passwordError.value = 'User session not found'
      return false
    }

    passwordError.value = null
    isChangingPassword.value = true

    try {
      const response = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmNewPassword,
          userId: authStore.session.id,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        passwordError.value = result.message || 'Failed to change password'
        toast.error(passwordError.value)
        return false
      }

      toast.success(result.message)
      return true
    } catch (error) {
      passwordError.value = 'Network error occurred'
      toast.error(passwordError.value)
      console.error('Password change error:', error)
      return false
    } finally {
      isChangingPassword.value = false
    }
  }

  const clearErrors = () => {
    nameError.value = null
    passwordError.value = null
  }

  return {
    changeName,
    changePassword,
    isChangingName,
    isChangingPassword,
    nameError,
    passwordError,
    clearErrors,
  }
}
