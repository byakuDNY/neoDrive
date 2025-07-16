import type { FileMetadata, PresignedUrl, UploadItem } from '@/lib/types'
import { getFileInfo } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { useBucketStore } from '@/stores/bucketStore'
import { useFileStore } from '@/stores/fileStore'
import { ref } from 'vue'

export const useUpload = () => {
  const { refetch } = useFileStore()
  const { session } = useAuthStore()
  const { loadSubscriptionUsage } = useBucketStore()

  const uploads = ref<UploadItem[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const showProgress = ref(false)

  const handleUpload = async (
    currentPath: string,
    type: 'folder' | 'file',
    // files?: FileList | File[],
    files?: FileList,
    folderName?: string,
  ) => {
    if (!session) {
      error.value = 'User session not found'
      return
    }

    // Reset error state
    error.value = null
    isLoading.value = true

    try {
      if (type === 'folder' && folderName) {
        return await createFolder(currentPath, folderName)
      }

      if (!files || files.length === 0) {
        error.value = 'No files selected'
        return
      }

      // Convert FileList to Array
      const fileArray = Array.from(files)

      // Initialize upload tracking
      uploads.value = fileArray.map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        progress: 0,
        status: 'pending',
        file,
      }))
      showProgress.value = true

      // Upload all files
      const uploadPromises = uploads.value.map((uploadItem) =>
        uploadSingleFile(currentPath, uploadItem),
      )
      await Promise.allSettled(uploadPromises)

      // Refresh file list and storage usage after uploads complete
      await Promise.all([refetch(), loadSubscriptionUsage()])
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Upload failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const uploadSingleFile = async (currentPath: string, uploadItem: UploadItem) => {
    try {
      uploadItem.status = 'uploading'

      const filePath =
        currentPath === '/' ? `/${uploadItem.file.name}` : `${currentPath}/${uploadItem.file.name}`

      const presignedUrlData: PresignedUrl = {
        name: uploadItem.file.name,
        size: uploadItem.file.size,
        mimeType: uploadItem.file.type,
        type: 'file',
        path: filePath,
      }

      const { presignedUrl, uniqueKey } = await getPresignedUrl(presignedUrlData)

      await uploadFile(uploadItem.file, presignedUrl, (progress) => {
        uploadItem.progress = progress
      })

      const fileMetadata: FileMetadata = {
        s3Key: uniqueKey,
        userId: session!.id,
        name: uploadItem.file.name,
        type: 'file',
        size: uploadItem.file.size,
        mimeType: uploadItem.file.type,
        path: filePath,
        isFavorited: false,
        category: getFileInfo(uploadItem.file.type).category,
      }

      await storeMetadata(fileMetadata)

      // Mark as completed
      uploadItem.status = 'completed'
      uploadItem.progress = 100
    } catch (err) {
      // Mark as error
      uploadItem.status = 'error'
      uploadItem.error = err instanceof Error ? err.message : 'Unknown error'
      throw err
    }
  }

  const createFolder = async (currentPath: string, folderName: string) => {
    try {
      isLoading.value = true
      error.value = null

      const folderPath = currentPath === '/' ? `/${folderName}` : `${currentPath}/${folderName}`

      const folderMetadata: FileMetadata = {
        s3Key: null,
        userId: session!.id,
        name: folderName,
        type: 'folder',
        size: 0,
        mimeType: null,
        path: folderPath,
        isFavorited: false,
        category: null,
      }

      await storeMetadata(folderMetadata)
      await refetch()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create folder'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const getPresignedUrl = async (presignedUrlData: PresignedUrl) => {
    const response = await fetch('/api/file/presignedUrl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(presignedUrlData),
    })

    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.message || 'Failed to get presigned URL')
    }
    return result
  }

  const uploadFile = async (
    file: File,
    presignedUrl: string,
    onProgress?: (progress: number) => void,
  ) => {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100)
          onProgress(progress)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve()
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'))
      })

      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timed out'))
      })

      xhr.open('PUT', presignedUrl)
      xhr.setRequestHeader('Content-Type', file.type)
      xhr.timeout = 300000 // 5 minute timeout
      xhr.send(file)
    })
  }

  const storeMetadata = async (data: FileMetadata) => {
    const response = await fetch('/api/file/uploadFileMetadata', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    })

    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.message ?? 'Failed to store file metadata')
    }
    return result
  }

  const cancelUpload = (id: string) => {
    const uploadIndex = uploads.value.findIndex((upload) => upload.id === id)
    if (uploadIndex !== -1) {
      uploads.value.splice(uploadIndex, 1)
    }
  }

  const dismissProgress = () => {
    uploads.value = []
    showProgress.value = false
  }

  const clearError = () => {
    error.value = null
  }

  return {
    handleUpload,
    isLoading,
    error,
    uploads,
    showProgress,
    cancelUpload,
    dismissProgress,
    clearError,
  }
}
