import type { SubscriptionUsage } from '@/lib/types'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useBucketStore = defineStore('bucket', () => {
  const subscriptionUsage = ref<SubscriptionUsage | null>(null)

  const canUpload = computed(() => {
    if (!subscriptionUsage.value) return true
    return subscriptionUsage.value.remainingStorage > 0
  })

  const storageUsagePercentage = computed(() => {
    const totalUsed = subscriptionUsage.value?.totalUsedStorage
    const maxTotal = subscriptionUsage.value?.maxTotalStorage
    if (typeof totalUsed !== 'number' || typeof maxTotal !== 'number' || maxTotal === 0) {
      return 0
    }
    const storagePercentage = (totalUsed / maxTotal) * 100
    return storagePercentage.toFixed(2)
  })

  const loadSubscriptionUsage = async () => {
    try {
      const response = await fetch('/api/file/getStorageUsage', {
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Failed to load subscription info:', data.message)
        return
      }

      subscriptionUsage.value = data
    } catch (error) {
      console.error('Failed to load subscription info:', error)
    }
  }

  return {
    subscriptionUsage,
    canUpload,
    storageUsagePercentage,
    loadSubscriptionUsage,
  }
})
