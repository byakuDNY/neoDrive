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

export const getInitials = (name?: string) => {
  if (!name) return 'ND'
  const names = name.split(' ')
  const initials = names.map((n) => n.charAt(0).toUpperCase()).join('')
  return initials.length > 2 ? initials.slice(0, 2) : initials
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

export const formatFileSize = (bytes: number) => {
  if (!bytes) return ''
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}
