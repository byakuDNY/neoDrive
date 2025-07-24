import type { Component } from 'vue'

export type User = {
  id: string
  name: string
  email: string
  subscription: string
}
export type FileCategory = 'images' | 'videos' | 'audios' | 'documents' | 'others'
export type SelectFile = {
  _id: string
  _v: number
  id: string
  userId: string
  name: string
  type: 'file' | 'folder'
  s3Key: string | null
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
  userId: string
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
  usedStorage: number
  storageLimit: number
  remainingStorage: number
  usagePercentage: number
  subscription: 'free' | 'pro' | 'premium'
}

export type UploadItem = {
  id: string
  name: string
  size: number
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error' | 'cancelled'
  error?: string
  file: File
}
