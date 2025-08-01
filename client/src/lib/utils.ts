import { type ClassValue, clsx } from 'clsx'
import {
  FileIcon,
  FileImageIcon,
  FileMusicIcon,
  FileTextIcon,
  FileVideoIcon,
  Folder,
} from 'lucide-vue-next'

// import { useBucketStore } from '@/stores/bucketStore'
import { twMerge } from 'tailwind-merge'
import type { Component } from 'vue'
import type { FileCategory } from './types'
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getFileInfo = (
  mimeType: string | null,
  type?: 'file' | 'folder',
): { category: FileCategory | null; icon: Component } => {
  if (type === 'folder') {
    return {
      category: null,
      icon: Folder,
    }
  }

  if (mimeType?.startsWith('image/')) {
    return {
      category: 'images',
      icon: FileImageIcon,
    }
  }

  if (mimeType?.startsWith('video/')) {
    return {
      category: 'videos',
      icon: FileVideoIcon,
    }
  }

  if (mimeType?.startsWith('audio/')) {
    return {
      category: 'audios',
      icon: FileMusicIcon,
    }
  }

  if (
    mimeType?.includes('text') ||
    mimeType?.includes('pdf') ||
    mimeType?.includes('document') ||
    mimeType?.includes('spreadsheet') ||
    mimeType?.includes('presentation')
  ) {
    return {
      category: 'documents',
      icon: FileTextIcon,
    }
  }

  return {
    category: 'others',
    icon: FileIcon,
  }
}

export const formatBytes = (bytes: number) => {
  if (!bytes) return ''
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export const validateFileSizes = async (files: FileList, remainingStorage: number | undefined) => {
  if (!remainingStorage) {
    return {
      error: true,
      errorMessage: 'Unable to check storage limits. Please try again.',
    }
  }

  const totalFileSize = Array.from(files).reduce((sum, file) => sum + file.size, 0)

  if (totalFileSize > remainingStorage) {
    return {
      error: true,
      errorMessage: `Upload size (${formatBytes(totalFileSize)}) exceeds remaining storage (${formatBytes(remainingStorage)}). Please upgrade your subscription or delete some files.`,
    }
  }

  return { error: false, errorMessage: null }
}
