<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/stores/authStore'
import { useBucketStore } from '@/stores/bucketStore'
import {
  AlertCircle,
  Check,
  Crown,
  FileText,
  HardDrive,
  Image,
  Music,
  Star,
  TrendingUp,
  Video,
  Zap,
} from 'lucide-vue-next'
import { computed, onMounted } from 'vue'

const bucketStore = useBucketStore()
const authStore = useAuthStore()

// Subscription limits
const SUBSCRIPTION_LIMITS = {
  free: {
    name: 'Free',
    price: '$0',
    period: 'forever',
    maxFileSize: 30 * 1024 * 1024, // 30MB
    maxTotalStorage: 100 * 1024 * 1024, // 100MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'text/plain', 'application/pdf'],
    features: [
      '100 MB total storage',
      '30 MB max file size',
      'Basic file types only',
      'Web access',
      'Basic support',
    ],
  },
  pro: {
    name: 'Pro',
    price: '$9.99',
    period: 'per month',
    maxFileSize: 1024 * 1024 * 1024, // 1GB
    maxTotalStorage: 5 * 1024 * 1024 * 1024, // 5GB
    allowedMimeTypes: null, // null means all types allowed
    features: [
      '5 GB total storage',
      '1 GB max file size',
      'All file types supported',
      'Priority support',
      'File versioning',
      'Advanced sharing',
    ],
  },
  premium: {
    name: 'Premium',
    price: '$19.99',
    period: 'per month',
    maxFileSize: 30 * 1024 * 1024 * 1024, // 30GB
    maxTotalStorage: 100 * 1024 * 1024 * 1024, // 100GB
    allowedMimeTypes: null, // null means all types allowed
    features: [
      '100 GB total storage',
      '30 GB max file size',
      'All file types supported',
      '24/7 premium support',
      'Team collaboration',
      'Advanced security',
      'Custom branding',
      'API access',
    ],
  },
}

// Current subscription (mock - replace with actual user subscription)
const currentPlan = computed(() => {
  return authStore.session?.subscription || 'free'
})

const currentPlanDetails = computed(() => {
  return SUBSCRIPTION_LIMITS[currentPlan.value as keyof typeof SUBSCRIPTION_LIMITS]
})

// Storage calculations
const storageUsed = computed(() => {
  return bucketStore.subscriptionUsage?.totalUsedStorage || 0
})

const storageTotal = computed(() => {
  return bucketStore.subscriptionUsage?.maxTotalStorage || 0
})

const storagePercentage = computed(() => {
  return Number(bucketStore.storageUsagePercentage)
})

const isStorageWarning = computed(() => {
  return storagePercentage.value > 80
})

// Format bytes helper
const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// File type icons
const fileTypeIcons = {
  'image/jpeg': Image,
  'image/png': Image,
  'image/gif': Image,
  'text/plain': FileText,
  'application/pdf': FileText,
  video: Video,
  audio: Music,
  document: FileText,
}

onMounted(async () => {
  await bucketStore.loadSubscriptionUsage()
})

const handleUpgrade = (planName: string) => {
  console.log(`Upgrading to ${planName}`)
  // Implement upgrade logic here
}

const handleManageBilling = () => {
  console.log('Managing billing')
  // Implement billing management
}
</script>

<template>
  <div class="space-y-6 p-4 md:p-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-heading">Subscription</h1>
        <p class="text-foreground/80">Manage your subscription and billing</p>
      </div>

      <div class="flex items-center gap-2">
        <Badge
          variant="outline"
          class="text-sm px-3 py-1"
          :class="
            currentPlan === 'premium'
              ? 'border-yellow-500 text-yellow-700'
              : currentPlan === 'pro'
                ? 'border-blue-500 text-blue-700'
                : 'border-gray-500 text-gray-700'
          "
        >
          <Crown v-if="currentPlan === 'premium'" class="size-3 mr-1" />
          <Star v-else-if="currentPlan === 'pro'" class="size-3 mr-1" />
          {{ currentPlanDetails.name }} Plan
        </Badge>
      </div>
    </div>

    <!-- Current Plan Overview -->
    <Card class="border-2 border-border rounded-base shadow-shadow">
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle class="flex items-center gap-2">
              <HardDrive class="size-5" />
              Current Usage
            </CardTitle>
            <CardDescription>Your storage and plan details</CardDescription>
          </div>
          <Button variant="neutral" @click="handleManageBilling"> Manage Billing </Button>
        </div>
      </CardHeader>
      <CardContent class="space-y-6">
        <!-- Storage Usage -->
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium">Storage Usage</span>
            <span class="text-sm text-foreground/70">
              {{ formatBytes(storageUsed) }} / {{ formatBytes(storageTotal) }}
            </span>
          </div>

          <!-- Progress Bar -->
          <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              class="h-2 rounded-full transition-all duration-300"
              :class="[isStorageWarning ? 'bg-yellow-500' : 'bg-main']"
              :style="{ width: `${Math.min(storagePercentage, 100)}%` }"
            ></div>
          </div>

          <div class="flex justify-between items-center text-xs text-foreground/60">
            <span>{{ storagePercentage.toFixed(1) }}% used</span>
            <span v-if="isStorageWarning" class="text-red-500 flex items-center gap-1">
              <AlertCircle class="size-3" />
              Storage running low
            </span>
          </div>
        </div>

        <!-- Current Plan Features -->
        <div class="grid md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <h4 class="font-medium text-sm">Current Plan Features</h4>
            <ul class="space-y-1 text-sm text-foreground/70">
              <li
                v-for="feature in currentPlanDetails.features"
                :key="feature"
                class="flex items-start gap-2"
              >
                <Check class="size-3 text-main mt-0.5 flex-shrink-0" />
                {{ feature }}
              </li>
            </ul>
          </div>

          <div class="space-y-2">
            <h4 class="font-medium text-sm">Allowed File Types</h4>
            <div v-if="currentPlanDetails.allowedMimeTypes" class="flex flex-wrap gap-1">
              <Badge
                v-for="mimeType in currentPlanDetails.allowedMimeTypes"
                :key="mimeType"
                variant="secondary"
                class="text-xs"
              >
                {{ mimeType.split('/')[1] || mimeType }}
              </Badge>
            </div>
            <div v-else class="flex items-center gap-2">
              <Badge variant="secondary" class="text-xs">All file types</Badge>
              <span class="text-xs text-main">✨ Unlimited</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Upgrade Plans -->
    <div class="space-y-4">
      <h2 class="text-2xl font-heading">Upgrade Your Plan</h2>
      <div class="grid md:grid-cols-3 gap-6">
        <Card
          v-for="(plan, key) in SUBSCRIPTION_LIMITS"
          :key="key"
          class="border-2 border-border rounded-base shadow-shadow relative"
          :class="[
            key === currentPlan ? 'ring-2 ring-main' : '',
            key === 'pro' ? 'scale-105 border-blue-500' : '',
            key === 'premium' ? 'border-yellow-500' : '',
          ]"
        >
          <!-- Popular Badge -->
          <div v-if="key === 'pro'" class="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge class="bg-blue-500 text-white">Most Popular</Badge>
          </div>

          <!-- Premium Badge -->
          <div v-if="key === 'premium'" class="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge class="bg-yellow-500 text-white">
              <Crown class="size-3 mr-1" />
              Premium
            </Badge>
          </div>

          <CardHeader class="text-center">
            <CardTitle class="flex items-center justify-center gap-2">
              <Zap v-if="key === 'free'" class="size-5" />
              <TrendingUp v-else-if="key === 'pro'" class="size-5 text-blue-500" />
              <Crown v-else class="size-5 text-yellow-500" />
              {{ plan.name }}
            </CardTitle>
            <div class="space-y-2">
              <div class="flex items-baseline justify-center gap-2">
                <span class="text-3xl font-heading">{{ plan.price }}</span>
                <span class="text-foreground/60">{{ plan.period }}</span>
              </div>
              <CardDescription>
                {{ formatBytes(plan.maxTotalStorage) }} storage •
                {{ formatBytes(plan.maxFileSize) }} max file size
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent class="space-y-4">
            <ul class="space-y-2">
              <li
                v-for="feature in plan.features"
                :key="feature"
                class="flex items-start gap-2 text-sm"
              >
                <Check class="size-4 text-main mt-0.5 flex-shrink-0" />
                {{ feature }}
              </li>
            </ul>

            <Button
              v-if="key !== currentPlan"
              @click="handleUpgrade(key)"
              class="w-full"
              :variant="key === 'pro' ? 'default' : 'neutral'"
            >
              {{ key === 'free' ? 'Downgrade' : 'Upgrade' }} to {{ plan.name }}
            </Button>

            <Button v-else variant="neutral" disabled class="w-full"> Current Plan </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
