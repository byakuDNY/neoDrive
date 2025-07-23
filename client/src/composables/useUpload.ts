import type { FileMetadata, PresignedUrl, UploadItem } from '@/lib/types'
import { getFileInfo } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { useBucketStore } from '@/stores/bucketStore'
import { useFileStore } from '@/stores/fileStore'
import { ref } from 'vue'
import { toast } from 'vue-sonner'

export const useUpload = () => {
  const { refetch } = useFileStore()
  const { session } = useAuthStore()
  const { loadSubscriptionUsage } = useBucketStore()

  const uploads = ref<UploadItem[]>([])
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)
  const showProgress = ref(false)
  const activeRequests = ref<Map<string, XMLHttpRequest>>(new Map())

  const processUpload = async (
    currentPath: string,
    type: 'folder' | 'file',
    files?: FileList,
    folderName?: string,
  ) => {
    if (!session) {
      errorMessage.value = 'User session not found'
      return
    }

    errorMessage.value = null
    isLoading.value = true

    try {
      if (type === 'folder' && folderName) {
        return await createFolder(currentPath, folderName)
      }

      if (!files || files.length === 0) {
        errorMessage.value = 'No files selected'
        return
      }

      uploads.value = Array.from(files).map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        progress: 0,
        status: 'pending',
        file,
      }))
      showProgress.value = true

      const uploadPromises = uploads.value.map((uploadItem) =>
        uploadSingleFile(currentPath, uploadItem),
      )
      await Promise.allSettled(uploadPromises)

      await Promise.all([refetch(), loadSubscriptionUsage()])
    } catch (error) {
      console.error('Error uploading files: ', error)
      errorMessage.value = error instanceof Error ? error.message : 'Upload failed'
    } finally {
      isLoading.value = false
    }
  }

  const createFolder = async (currentPath: string, folderName: string) => {
    try {
      const folderMetadataPayload: FileMetadata = {
        s3Key: null,
        userId: session!.id,
        name: folderName,
        type: 'folder',
        size: 0,
        mimeType: null,
        path: currentPath,
        isFavorited: false,
        category: null,
      }

      await storeMetadata(folderMetadataPayload)
      await refetch()
    } catch (error) {
      console.error('Error creating folder:', error)
      errorMessage.value = error instanceof Error ? error.message : 'Failed to create folder'
    } finally {
      isLoading.value = false
    }
  }

  const uploadSingleFile = async (currentPath: string, uploadItem: UploadItem) => {
    try {
      uploadItem.status = 'uploading'

      const presignedUrlPayload: PresignedUrl = {
        name: uploadItem.file.name,
        size: uploadItem.file.size,
        mimeType: uploadItem.file.type,
        type: 'file',
        path: currentPath,
      }

      const { presignedUrl, uniqueKey } = await getPresignedUrl(presignedUrlPayload)

      await uploadFile(uploadItem.file, presignedUrl, uploadItem.id, (progress) => {
        uploadItem.progress = progress
      })

      const fileMetadata: FileMetadata = {
        s3Key: uniqueKey,
        userId: session!.id,
        name: uploadItem.file.name,
        type: 'file',
        size: uploadItem.file.size,
        mimeType: uploadItem.file.type,
        path: currentPath,
        isFavorited: false,
        category: getFileInfo(uploadItem.file.type).category,
      }

      await storeMetadata(fileMetadata)

      // Mark as completed
      uploadItem.status = 'completed'
      uploadItem.progress = 100
      activeRequests.value.delete(uploadItem.id)
    } catch (err) {
      if (err instanceof Error && err.message === 'Upload cancelled') {
        uploadItem.status = 'cancelled'
        uploadItem.error = 'Cancelled by user'
      } else {
        uploadItem.status = 'error'
        uploadItem.error = err instanceof Error ? err.message : 'Unknown error'
      }
      activeRequests.value.delete(uploadItem.id)
      throw err
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
      throw new Error(result.message ?? 'Failed to get presigned URL')
    }
    return result
  }

  const uploadFile = async (
    file: File,
    presignedUrl: string,
    uploadId: string,
    onProgress?: (progress: number) => void,
  ) => {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      activeRequests.value.set(uploadId, xhr)

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100)
          console.log(file.name, progress)
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

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'))
      })

      xhr.open('PUT', presignedUrl)
      xhr.setRequestHeader('Content-Type', file.type)
      xhr.timeout = 300000 // 5 minute timeout
      xhr.send(file)
    })
  }

  const storeMetadata = async (payload: FileMetadata) => {
    const response = await fetch('/api/file/uploadFileMetadata', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    })

    const result = await response.json()
    if (!response.ok) {
      console.error('Failed to store file metadata: ', result.message)
      throw new Error(result.message ?? 'Failed to store file metadata')
    }
  }

  const cancelUpload = (id: string) => {
    const xhr = activeRequests.value.get(id)
    if (xhr) {
      xhr.abort()
      activeRequests.value.delete(id)
    }

    const upload = uploads.value.find((upload) => upload.id === id)
    if (upload) {
      upload.status = 'cancelled'
      upload.error = 'Cancelled by user'
    }
  }

  const dismissProgress = () => {
    const hasActiveUploads = uploads.value.some(
      (upload) => upload.status === 'pending' || upload.status === 'uploading',
    )

    if (!hasActiveUploads) {
      uploads.value = []
      showProgress.value = false
    } else {
      toast.error('There are active uploads. Please wait until they are finished.')
    }
  }

  const toggleProgress = () => {
    if (uploads.value.length > 0) {
      showProgress.value = !showProgress.value
    }
  }

  const clearError = () => {
    errorMessage.value = null
  }

  return {
    handleUpload: processUpload,
    isLoading,
    error: errorMessage,
    uploads,
    showProgress,
    cancelUpload,
    dismissProgress,
    toggleProgress,
    clearError,
  }
}
