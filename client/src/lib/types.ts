import type { Component } from 'vue'

export type User = {
  id: string
  name: string
  email: string
  subscription: string
}
export type FileCategory = 'images' | 'videos' | 'audios' | 'documents' | 'others'
export type SelectFile = {
  id: string
  userId: string
  name: string
  type: 'file' | 'folder'
  size: number
  mimeType: string | null
  path: string
  isFavorited: boolean
  category: FileCategory | null
  url: string | null
  createdAt: Date
  updatedAt: Date
  icon: Component
}

export type PresignedUrl = {
  name: string
  size: number
  mimeType: string | null
  type: 'file' | 'folder'
  path: string
}

export type FileMetadata = {
  s3Key: string | null
  userId: string
  name: string
  type: 'file' | 'folder'
  size: number
  mimeType: string | null
  path: string
  isFavorited: boolean
  category: FileCategory | null
}

export type SubscriptionUsage = {
  maxFileSize: number
  maxTotalStorage: number
  totalUsedStorage: number
  remainingStorage: number
  allowedMimeTypes: string[] | null
}
