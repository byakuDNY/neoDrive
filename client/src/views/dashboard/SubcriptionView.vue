<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PRICING_PLANS } from '@/lib/constants'
import { useAuthStore } from '@/stores/authStore'
import { useBucketStore } from '@/stores/bucketStore'
import { AlertCircle, Crown, HardDrive, Star, TrendingUp, Zap } from 'lucide-vue-next'
import { computed, onMounted } from 'vue'

const bucketStore = useBucketStore()
const authStore = useAuthStore()

// Current subscription
const currentPlan = computed(() => {
  return authStore.session?.subscription || 'free'
})

const currentPlanDetails = computed(() => {
  return (
    PRICING_PLANS.find((plan) => plan.name.toLowerCase() === currentPlan.value.toLowerCase()) ||
    PRICING_PLANS[0]
  )
})

// Storage calculations
const storageUsed = computed(() => {
  return bucketStore.subscriptionUsage?.usedStorage || 0
})

const storageTotal = computed(() => {
  return bucketStore.subscriptionUsage?.storageLimit || 0
})

const storagePercentage = computed(() => {
  return Number(bucketStore.storageUsagePercentage) || 0
})

const isStorageWarning = computed(() => {
  return storagePercentage.value > 80
})

const isStorageCritical = computed(() => {
  return storagePercentage.value > 95
})

// Format bytes helper
const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Get plan key from plan name
const getPlanKey = (planName: string) => {
  return planName.toLowerCase()
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
        <p class="text-foreground/80">Manage your subscription and storage</p>
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
          <Zap v-else class="size-3 mr-1" />
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
              Storage Usage
            </CardTitle>
            <CardDescription>Your current storage usage and plan details</CardDescription>
          </div>
          <Button variant="neutral" @click="handleManageBilling"> Manage Billing </Button>
        </div>
      </CardHeader>
      <CardContent class="space-y-6">
        <!-- Storage Usage -->
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-lg font-medium">{{ currentPlanDetails.name }} Plan</span>
            <span class="text-lg font-mono">
              {{ formatBytes(storageUsed) }} / {{ formatBytes(storageTotal) }}
            </span>
          </div>

          <!-- Progress Bar -->
          <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              class="h-3 rounded-full transition-all duration-300"
              :class="[
                isStorageCritical ? 'bg-red-500' : isStorageWarning ? 'bg-yellow-500' : 'bg-main',
              ]"
              :style="{ width: `${Math.min(storagePercentage, 100)}%` }"
            ></div>
          </div>

          <div class="flex justify-between items-center">
            <span class="text-sm text-foreground/70">{{ storagePercentage.toFixed(1) }}% used</span>
            <span
              v-if="isStorageWarning"
              class="text-red-500 flex items-center gap-1 text-sm font-medium"
            >
              <AlertCircle class="size-4" />
              {{ isStorageCritical ? 'Storage almost full!' : 'Storage running low' }}
            </span>
          </div>
        </div>

        <!-- Storage Warning Card -->
        <div
          v-if="isStorageWarning"
          class="p-4 rounded-base border-2"
          :class="
            isStorageCritical
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-yellow-50 border-yellow-200 text-yellow-800'
          "
        >
          <div class="flex items-start gap-3">
            <AlertCircle
              class="size-5 mt-0.5 flex-shrink-0"
              :class="isStorageCritical ? 'text-red-500' : 'text-yellow-500'"
            />
            <div class="space-y-1">
              <p class="font-medium">
                {{ isStorageCritical ? 'Storage limit reached!' : 'Storage running low' }}
              </p>
              <p class="text-sm">
                {{
                  isStorageCritical
                    ? "You've used most of your storage space. Upgrade to continue uploading files."
                    : 'Consider upgrading your plan to get more storage space.'
                }}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Available Plans -->
    <div class="space-y-4">
      <h2 class="text-2xl font-heading">Choose Your Plan</h2>
      <p class="text-foreground/70">Simple storage plans that scale with your needs</p>

      <div class="grid md:grid-cols-3 gap-6">
        <Card
          v-for="plan in PRICING_PLANS"
          :key="plan.name"
          class="border-2 border-border rounded-base shadow-shadow relative transition-all duration-200"
          :class="[
            getPlanKey(plan.name) === currentPlan
              ? 'ring-2 ring-main bg-main/5'
              : 'hover:shadow-lg',
            plan.popular ? 'scale-105 border-blue-500' : '',
            plan.name === 'Premium' ? 'border-yellow-500' : '',
          ]"
        >
          <!-- Popular Badge -->
          <div v-if="plan.popular" class="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge class="bg-blue-500 text-white">Most Popular</Badge>
          </div>

          <!-- Premium Badge -->
          <div
            v-if="plan.name === 'Premium'"
            class="absolute -top-3 left-1/2 transform -translate-x-1/2"
          >
            <Badge class="bg-yellow-500 text-white">
              <Crown class="size-3 mr-1" />
              Premium
            </Badge>
          </div>

          <CardHeader class="text-center">
            <CardTitle class="flex items-center justify-center gap-2">
              <Zap v-if="plan.name === 'Free'" class="size-5" />
              <TrendingUp v-else-if="plan.name === 'Pro'" class="size-5 text-blue-500" />
              <Crown v-else class="size-5 text-yellow-500" />
              {{ plan.name }}
            </CardTitle>
            <div class="space-y-2">
              <div class="flex items-baseline justify-center gap-2">
                <span class="text-4xl font-heading">{{ plan.price }}</span>
                <span class="text-foreground/60">{{ plan.period }}</span>
              </div>
              <CardDescription class="text-center">
                {{ plan.description }}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent class="space-y-6">
            <!-- Storage Feature -->
            <div class="text-center space-y-2">
              <div class="flex items-center justify-center gap-2">
                <HardDrive class="size-5 text-main" />
                <span class="text-2xl font-bold">{{ plan.features }}</span>
              </div>
              <p class="text-sm text-foreground/70">Storage space</p>
            </div>

            <!-- Current Plan Indicator -->
            <div v-if="getPlanKey(plan.name) === currentPlan" class="text-center">
              <Badge variant="default" class="px-4 py-2"> Current Plan </Badge>
            </div>

            <!-- Action Button -->
            <Button
              v-else
              @click="handleUpgrade(getPlanKey(plan.name))"
              class="w-full"
              :variant="
                plan.name === 'Pro' ? 'default' : plan.name === 'Premium' ? 'default' : 'neutral'
              "
              :class="plan.name === 'Premium' ? 'bg-yellow-500 hover:bg-yellow-600' : ''"
            >
              {{ plan.name === 'Free' ? 'Downgrade' : 'Upgrade' }} to {{ plan.name }}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
