import type { FileCategory, SelectFile } from '@/lib/types'
import { getFileInfo } from '@/lib/utils'
import { useQuery } from '@tanstack/vue-query'
import { defineStore } from 'pinia'
import { computed } from 'vue'

const fetchFiles = async (): Promise<Omit<SelectFile, 'icon'>[]> => {
  // await new Promise((resolve) => setTimeout(resolve, 1000))

  const response = await fetch('/api/file', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('Error retrieving files:', data.message)
    throw new Error(data.message ?? 'Failed to store file metadata')
  }

  console.log('Files:', data.filesWithUrls)

  return data.filesWithUrls ?? []
  // return mockFileData
}

export const useFileStore = defineStore('file', () => {
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ['files'],
    queryFn: fetchFiles,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
        const filePath = file.path
        const parentPath = filePath.substring(0, filePath.lastIndexOf('/')) || '/'
        return parentPath === path
      }) ?? []
    )
  }

  const getCategoryFiles = (category: FileCategory | 'favorites') => {
    if (category === 'favorites') {
      return allFiles.value.filter((file) => file.type === 'file' && file.isFavorited)
    }

    return allFiles.value.filter((file) => file.type === 'file' && file.category === category)
  }

  const toggleFavorite = (fileId: string) => {
    const file = allFiles.value.find((file) => file.id === fileId)
    if (file) {
      file.isFavorited = !file.isFavorited
      // Call API to update favorite status
    }
  }

  return {
    allFiles,
    isPending,
    error,

    toggleFavorite,
    refetch,
    getFilesByPath,
    getCategoryFiles,
  }
})
