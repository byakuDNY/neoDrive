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
    if (!subscriptionUsage.value) return 0
    return subscriptionUsage.value.usagePercentage
  })

  const loadSubscriptionUsage = async () => {
    try {
      const response = await fetch('/api/file/getStorageUsage', {
        credentials: 'include',
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Failed to load subscription info:', result.message)
        return
      }

      subscriptionUsage.value = result.data
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
