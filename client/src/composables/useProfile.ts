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
      nameError.value = 'Invalid session'
      return
    }

    nameError.value = null
    isChangingName.value = true

    try {
      const response = await fetch('/api/user/name', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: newName, userId: authStore.session?.id }),
      })

      const { message, data: updatedName } = await response.json()

      if (!response.ok) {
        nameError.value = message ?? 'Failed to change name'
        return
      }

      authStore.setSession({ ...authStore.session, name: updatedName })
      toast.success('Name updated successfully')
    } catch (error) {
      console.error('Network error changing name:', error)
      nameError.value = 'Network error. Please check your connection.'
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
      passwordError.value = 'Invalid session'
      return
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

      const { message } = await response.json()

      if (!response.ok) {
        passwordError.value = message ?? 'Failed to change password'
        return
      }

      toast.success('Password updated successfully')
    } catch (error) {
      console.error('Network error changing password:', error)
      passwordError.value = 'Network error. Please check your connection.'
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
