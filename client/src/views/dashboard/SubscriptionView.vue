<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { PRICING_PLANS } from '@/lib/constants'
import type { SubscriptionPlan } from '@/lib/types'
import { formatBytes } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { useBucketStore } from '@/stores/bucketStore'
import { useFetch } from '@vueuse/core'
import {
  AlertCircle,
  CheckCircle,
  Crown,
  HardDrive,
  Loader2,
  Star,
  TrendingUp,
  X,
  XCircle,
  Zap,
} from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'

const bucketStore = useBucketStore()
const authStore = useAuthStore()

const showPaymentResult = ref(false)
const paymentSuccess = ref(false)
const paymentMessage = ref('')
const isLoading = ref(false)

const showUpgradeDialog = ref(false)
const pendingPlanName = ref<SubscriptionPlan | null>(null)
const upgradeDialogTitle = ref('')
const upgradeDialogDescription = ref('')

const currentPlan = computed(() => {
  const subscription = authStore.session?.subscription || 'Free'
  return PRICING_PLANS.find((plan) => plan.name === subscription)
})

const storagePercentage = computed(() => {
  return Number(bucketStore.storageUsagePercentage)
})

const isStorageWarning = computed(() => {
  return storagePercentage.value > 80
})

const isStorageCritical = computed(() => {
  return storagePercentage.value > 95
})

onMounted(async () => {
  // Check for payment result in URL
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('success') === 'true') {
    showPaymentResult.value = true
    paymentSuccess.value = true
    paymentMessage.value = 'Payment successful! Your subscription has been updated'

    await authStore.updateSession()

    toast.success('Payment successful! Your subscription has been updated')
  } else if (urlParams.get('canceled') === 'true') {
    showPaymentResult.value = true
    paymentSuccess.value = false
    paymentMessage.value = 'Payment was canceled. No charges were made to your account'

    toast.info('Payment was canceled. You can try again anytime.')
  }
  window.history.replaceState({}, document.title, window.location.pathname)
})

const showUpgradeConfirmation = (planName: string) => {
  pendingPlanName.value = planName as SubscriptionPlan

  if (planName === 'Premium' && currentPlan.value?.name === 'Pro') {
    upgradeDialogTitle.value = 'Upgrade to Premium?'
    upgradeDialogDescription.value =
      'You will become Premium immediately and will be charged the difference between your current plan and the Premium plan at the next billing cycle.'
  } else if (planName === 'Pro' && currentPlan.value?.name === 'Premium') {
    upgradeDialogTitle.value = 'Downgrade to Pro?'
    upgradeDialogDescription.value =
      'You will keep being Premium until the end of your current billing cycle, but you will be charged the Pro plan at the next billing cycle.'
  } else if (planName === 'Free') {
    upgradeDialogTitle.value = 'Downgrade to Free?'
    upgradeDialogDescription.value =
      'You will keep your current plan until the end of your current billing cycle.'
  } else {
    // Direct upgrade from Free
    upgradeDialogTitle.value = `Upgrade to ${planName}?`
    upgradeDialogDescription.value = `You will be redirected to checkout to complete your ${planName} subscription.`
  }

  showUpgradeDialog.value = true
}

const confirmUpgrade = async () => {
  showUpgradeDialog.value = false

  if (pendingPlanName.value) {
    await handleUpgrade(pendingPlanName.value)
  }
}

const handleUpgrade = async (planName: string) => {
  isLoading.value = true
  try {
    // CANCEL SUBSCRIPTION
    if (planName === 'Free') {
      const { data, error } = await useFetch('/api/stripe/cancel', {
        method: 'POST',
        credentials: 'include',
      }).json()
      if (error.value) {
        throw new Error(data.value.message ?? 'Failed to cancel subscription')
      }

      paymentSuccess.value = true
      paymentMessage.value =
        'Successfully canceled subscription. You will be downgraded to Free plan at the end of your current billing cycle.'
    // SUBSCRIBE TO A PLAN FROM FREE
    } else if (currentPlan.value?.name === 'Free') {
      const checkoutPayload = {
        product: planName,
        successUrl: `${window.location.origin}/dashboard/subscription?success=true`,
        cancelUrl: `${window.location.origin}/dashboard/subscription?canceled=true`,
        userId: authStore.session?.id,
      }
      const { data, error } = await useFetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(checkoutPayload),
      }).json()

      if (error.value) {
        throw new Error(data.value.message ?? 'Failed to create checkout session')
      }

      if (data.value.url) {
        window.location.href = data.value.url
      } else {
        throw new Error('No checkout URL received')
      }
    // UPGRADE OR DOWNGRADE
    } else {
      const checkoutPayload = {
        product: planName,
        successUrl: `${window.location.origin}/dashboard/subscription?success=true`,
        cancelUrl: `${window.location.origin}/dashboard/subscription?canceled=true`,
        userId: authStore.session?.id,
      }
      const { data, error } = await useFetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(checkoutPayload),
      }).json()

      if (error.value) {
        throw new Error(data.value.message ?? 'Failed to create checkout session')
      }
      toast.info('Successfully upgraded / downgraded your subscription.')
    }
    await authStore.updateSession()
    await bucketStore.loadSubscriptionUsage()
  } catch (error) {
    console.error('Error upgrading subscription:', error)
    toast.error(error instanceof Error ? error.message : 'Failed to upgrade subscription')
  } finally {
    isLoading.value = false
  }
}

const canUpgrade = (planName: string) => {
  const currentPlanIndex = PRICING_PLANS.findIndex((plan) => plan.name === currentPlan.value?.name)
  const targetPlanIndex = PRICING_PLANS.findIndex((plan) => plan.name === planName)

  return targetPlanIndex > currentPlanIndex
}

const canDowngrade = (planName: string) => {
  const currentPlanIndex = PRICING_PLANS.findIndex((plan) => plan.name === currentPlan.value?.name)
  const targetPlanIndex = PRICING_PLANS.findIndex((plan) => plan.name === planName)

  return targetPlanIndex < currentPlanIndex
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
        <Badge variant="neutral" class="text-sm px-3 py-1" :class="currentPlan?.name === 'Premium'
            ? 'border-yellow-500 text-yellow-700'
            : currentPlan?.name === 'Pro'
              ? 'border-blue-500 text-blue-700'
              : ''
          ">
          <Crown v-if="currentPlan?.name === 'Premium'" class="size-3 mr-1" />
          <Star v-else-if="currentPlan?.name === 'Pro'" class="size-3 mr-1" />
          <Zap v-else class="size-3 mr-1" />
          {{ currentPlan?.name }} Plan
        </Badge>
      </div>
    </div>

    <!-- Payment Result Card -->
    <Card v-if="showPaymentResult" :class="paymentSuccess ? 'border-green-500 ' : 'border-red-500 '">
      <CardContent>
        <div class="flex items-center justify-between">
          <!-- Success State -->
          <div v-if="paymentSuccess" class="flex items-center gap-3 text-green-500">
            <CheckCircle class="size-8" />
            <div>
              <h3 class="text-lg font-semibold">Payment Successful!</h3>
              <p>{{ paymentMessage }}</p>
            </div>
          </div>

          <!-- Error State -->
          <div v-else class="flex items-center gap-3 text-red-500">
            <XCircle class="size-8" />
            <div>
              <h3 class="text-lg font-semibold">Payment Canceled</h3>
              <p>{{ paymentMessage }}</p>
            </div>
          </div>

          <Button @click="() => (showPaymentResult = false)" variant="neutral">
            <X />
          </Button>
        </div>
      </CardContent>
    </Card>

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
        </div>
      </CardHeader>
      <CardContent class="space-y-6">
        <!-- Storage Usage -->
        <div class="space-y-4">
          <div class="flex justify-between items-center" v-if="bucketStore.subscriptionUsage">
            <span class="text-lg font-medium">{{ currentPlan?.name }} Plan</span>
            <span class="text-lg font-mono">
              {{ formatBytes(bucketStore.subscriptionUsage.usedStorage) }} /
              {{ formatBytes(bucketStore.subscriptionUsage.storageLimit) }}
            </span>
          </div>

          <!-- Progress Bar -->
          <Progress :model-value="storagePercentage" :class="[
            isStorageCritical
              ? '[&>div]:bg-red-500'
              : isStorageWarning
                ? '[&>div]:bg-yellow-500'
                : '[&>div]:bg-main',
          ]" />

          <div class="flex justify-between items-center">
            <span class="text-sm text-foreground/70">{{ storagePercentage.toFixed(1) }}% used</span>
            <span v-if="isStorageWarning" class="flex items-center gap-1 text-sm font-medium"
              :class="isStorageCritical ? 'text-red-500' : 'text-yellow-700 dark:text-yellow-700'">
              <AlertCircle class="size-4" />
              {{ isStorageCritical ? 'Storage almost full!' : 'Storage running low' }}
            </span>
          </div>
        </div>

        <!-- Storage Warning Card -->
        <div v-if="isStorageWarning" class="p-4 rounded-base border-2" :class="isStorageCritical
            ? ' bg-secondary-background border-red-200 text-red-700 dark:text-red-500'
            : ' bg-secondary-background border-yellow-200 text-yellow-700 dark:text-yellow-500'
          ">
          <div class="flex items-start gap-3">
            <AlertCircle class="size-5 mt-0.5 flex-shrink-0"
              :class="isStorageCritical ? 'text-red-500' : 'text-yellow-500'" />
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
        <Card v-for="plan in PRICING_PLANS" :key="plan.name"
          class="border-2 border-border rounded-base shadow-shadow relative transition-all duration-200" :class="[
            plan.popular ? 'scale-105 border-blue-500' : '',
            plan.name === 'Premium' ? 'border-yellow-500' : '',
          ]">
          <!-- Popular Badge -->
          <div v-if="plan.popular" class="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge class="bg-blue-500 text-white">
              <Star />
              Most Popular
            </Badge>
          </div>

          <!-- Premium Badge -->
          <div v-if="plan.name === 'Premium'" class="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge class="bg-yellow-700 text-white">
              <Crown />
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
            <div v-if="plan.name === currentPlan?.name" class="text-center">
              <Badge variant="default" class="px-4 py-2"> Current Plan </Badge>
            </div>

            <!-- Action Button -->
            <AlertDialog v-else>
              <AlertDialogTrigger as-child>
                <Button @click="showUpgradeConfirmation(plan.name)"
                  :disabled="isLoading || (!canUpgrade(plan.name) && !canDowngrade(plan.name))" class="w-full" :variant="plan.name === 'Pro'
                      ? 'default'
                      : plan.name === 'Premium'
                        ? 'default'
                        : 'neutral'
                    " :class="plan.name === 'Premium' ? 'bg-yellow-500 hover:bg-yellow-600' : ''">
                  <Loader2 v-if="isLoading" class="size-4 mr-2 animate-spin" />
                  <template v-if="canUpgrade(plan.name)"> Upgrade to {{ plan.name }} </template>
                  <template v-else-if="canDowngrade(plan.name)">
                    Downgrade to {{ plan.name }}
                  </template>
                  <template v-else> {{ plan.name }} Plan </template>
                </Button>
              </AlertDialogTrigger>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>

    <AlertDialog v-model:open="showUpgradeDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{ upgradeDialogTitle }}</AlertDialogTitle>
          <AlertDialogDescription>
            {{ upgradeDialogDescription }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction @click="confirmUpgrade"> Continue </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
