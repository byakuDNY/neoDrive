import type { FileCategory, SelectFile } from '@/lib/types'
import { getFileInfo } from '@/lib/utils'
import { useQuery } from '@tanstack/vue-query'
import { defineStore } from 'pinia'
import { computed } from 'vue'
import { toast } from 'vue-sonner'
import { useAuthStore } from './authStore'
import { useBucketStore } from './bucketStore'

const fetchFiles = async (): Promise<Omit<SelectFile, 'icon'>[]> => {
  // await new Promise((resolve) => setTimeout(resolve, 1000))

  const response = await fetch('/api/file', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  const { message, data } = await response.json()
  if (!response.ok) {
    if (response.status === 401) {
      const authStore = useAuthStore()
      authStore.clearSession()

      window.location.href = '/login'

      return []
    }
    throw new Error(message ?? 'Failed to store file metadata')
  }

  console.log('Files:', data.files)

  return data.files ?? []
  // return MOCK_FILE_DATA
}

export const useFileStore = defineStore('file', () => {
  const bucketStore = useBucketStore()
  const authStore = useAuthStore()

  const queryKey = computed(() => ['files', authStore.session?.id])
  const isEnabled = computed(() => !!authStore.session?.id)

  const { data, isPending, error, refetch } = useQuery({
    queryKey,
    queryFn: fetchFiles,
    staleTime: 5 * 60 * 1000,
    enabled: isEnabled,
  })

  const allFiles = computed<SelectFile[]>(() => {
    if (!data.value || !Array.isArray(data.value)) return []

    return data.value.map((file) => {
      return {
        ...file,
        icon: getFileInfo(file.mimeType, file.type).icon,
      }
    })
  })

  const getFilesByPath = (path: string = '/') => {
    return (
      allFiles.value.filter((file) => {
        return file.path === path
      }) ?? []
    )
  }

  const getCategoryFiles = (category: FileCategory | 'favorites') => {
    if (category === 'favorites') {
      return allFiles.value.filter((file) => file.type === 'file' && file.isFavorited)
    }

    return allFiles.value.filter((file) => file.type === 'file' && file.category === category)
  }

  const renameFile = async (file: SelectFile, newName: string) => {
    const payload = {
      id: file.id,
      userId: file.userId,
      name: newName,
      type: file.type,
      s3Key: file.s3Key ?? null,
      path: file.path,
    }

    try {
      const response = await fetch('/api/file/renameFile', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          onInvalidSession()
          return
        }
        toast.error(data.message ?? 'Failed to rename file')
        throw new Error(data.message ?? 'Failed to rename file')
      }

      await refetch()
    } catch (error) {
      console.error('Rename error:', error)
      toast.error('Failed to rename file')
    }
  }

  const toggleFavorite = async (file: SelectFile) => {
    const isFavorited = file.isFavorited
    const payload = {
      id: file.id,
      userId: file.userId,
      type: file.type,
      isFavorited: file.isFavorited,
    }

    try {
      const response = await fetch('/api/file/toggleFavorite', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          onInvalidSession()
          return
        }
        // toast.error(data.message ?? `Failed to ${isFavorited ? 'unfavorite' : 'favorite'} file: `)
        throw new Error(
          data.message ?? `Failed to ${isFavorited ? 'unfavorite' : 'favorite'} file: `,
        )
      }

      await refetch()
      toast.success(data.message)
    } catch (error) {
      toast.error(`Failed to ${isFavorited ? 'unfavorite' : 'favorite'} file:`)
      throw error
    }
  }

  const downloadFile = async (item: SelectFile) => {
    const response = await fetch(item.url!)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = item.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    window.URL.revokeObjectURL(url)
  }

  const removeFile = async (file: SelectFile) => {
    const payload = {
      id: file.id,
      userId: file.userId,
      s3Key: file.s3Key ?? null,
      type: file.type,
    }

    try {
      const response = await fetch(`/api/file`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          onInvalidSession()
          return
        }
        toast.error(data.message ?? 'Failed to delete file')
        throw new Error(data.message ?? 'Failed to delete file')
      }

      toast.success(data.message ?? 'File deleted successfully')
      await refetch()
      await bucketStore.loadSubscriptionUsage()
    } catch (error) {
      toast.error('Failed to delete file')
      throw error
    }
  }

  const onInvalidSession = () => {
    authStore.clearSession()
    // window.location.href = '/login'
  }

  return {
    allFiles,
    isPending,
    error,
    renameFile,
    toggleFavorite,
    downloadFile,
    removeFile,
    refetch,
    getFilesByPath,
    getCategoryFiles,
  }
})
