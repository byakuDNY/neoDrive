<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import {
  Calendar,
  CreditCard,
  DollarSign,
  Loader2,
  LogOut,
  TrendingUp,
  Users,
} from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

interface PaymentHistory {
  _id: string
  userId: string
  subscriptionId: {
    name: string
    price: number
  }
  amount: number
  paymentDate: Date
  stripeSubscriptionId?: string
}

const isLoading = ref(false)
const paymentHistories = ref<PaymentHistory[]>([])
const isLoadingPayments = ref(false)
const error = ref<string | null>(null)
const router = useRouter()

const logout = async () => {
  isLoading.value = true
  try {
    const response = await fetch(`/api/auth/admin/logout`, {
      method: 'POST',
      credentials: 'include',
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Logout failed:', data.message)
    }

    const { clearAdminSession } = useAuthStore()
    clearAdminSession()

    router.push('/')
  } catch (error) {
    console.error('Logout error:', error)

    const { clearAdminSession } = useAuthStore()
    clearAdminSession()
  } finally {
    isLoading.value = false
  }
}

const fetchPaymentHistories = async () => {
  isLoadingPayments.value = true
  error.value = null

  try {
    const response = await fetch('http://localhost:3000/api/paymentHistories', {
      credentials: 'include',
    })

    const { message, data } = await response.json()

    if (!response.ok) {
      error.value = message || 'Failed to fetch payment histories'
      return
    }

    console.log('Payment histories fetched:', data)

    paymentHistories.value = data
  } catch (err) {
    error.value = 'Network error occurred'
    console.error('Error fetching payment histories:', err)
  } finally {
    isLoadingPayments.value = false
  }
}

// Computed stats
const totalRevenue = computed(() =>
  paymentHistories.value.reduce((sum, payment) => sum + payment.amount, 0),
)

const totalTransactions = computed(() => paymentHistories.value.length)

const uniqueUsers = computed(
  () => new Set(paymentHistories.value.map((payment) => payment.userId)).size,
)

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount) // Convert from cents
}

onMounted(() => {
  fetchPaymentHistories()
})
</script>

<template>
  <section class="p-4 md:p-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center space-x-4">
        <div class="p-3 bg-background border-2 border-border rounded-base shadow-shadow">
          <TrendingUp class="text-main size-8" />
        </div>
        <div>
          <h1 class="text-2xl font-heading">Admin Dashboard</h1>
          <p class="text-muted-foreground">Manage your application and view analytics</p>
        </div>
      </div>

      <Button @click="logout" :disabled="isLoading" variant="neutral">
        <LogOut v-if="!isLoading" class="size-4 mr-2" />
        <div v-else class="flex items-center">
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        </div>
        {{ isLoading ? 'Logging out...' : 'Logout' }}
      </Button>
    </div>

    <!-- Stats Cards -->
    <div class="grid gap-4 md:grid-cols-3 mb-6">
      <div class="bg-background border-2 border-border rounded-base shadow-shadow p-6">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-green-100 rounded-base">
            <DollarSign class="size-6 text-green-600" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Total Revenue</p>
            <p class="text-2xl font-heading">{{ formatCurrency(totalRevenue) }}</p>
          </div>
        </div>
      </div>

      <div class="bg-background border-2 border-border rounded-base shadow-shadow p-6">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-blue-100 rounded-base">
            <CreditCard class="size-6 text-blue-600" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Total Transactions</p>
            <p class="text-2xl font-heading">{{ totalTransactions }}</p>
          </div>
        </div>
      </div>

      <div class="bg-background border-2 border-border rounded-base shadow-shadow p-6">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-purple-100 rounded-base">
            <Users class="size-6 text-purple-600" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Paying Users</p>
            <p class="text-2xl font-heading">{{ uniqueUsers }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment History -->
    <section
      class="bg-background border-2 border-border rounded-base shadow-shadow overflow-hidden"
    >
      <div class="p-6 border-b border-border">
        <div class="flex items-center space-x-2 mb-2">
          <CreditCard class="size-5" />
          <h2 class="text-lg font-heading">Payment History</h2>
        </div>
        <p class="text-sm text-muted-foreground">View all subscription payments and transactions</p>
      </div>

      <!-- Loading State -->
      <section v-if="isLoadingPayments" class="p-12 text-center space-y-2">
        <Loader2 class="animate-spin size-16 mx-auto" />
        <h2>Loading payment histories...</h2>
      </section>

      <!-- Error State -->
      <section v-else-if="error" class="p-12 text-center space-y-2 text-red-500">
        <CreditCard class="size-16 mx-auto" />
        <h2>Error loading payment histories</h2>
        <p>{{ error }}</p>
        <Button @click="fetchPaymentHistories" class="mt-4">Try Again</Button>
      </section>

      <!-- Empty State -->
      <section v-else-if="paymentHistories.length === 0" class="p-12 text-center space-y-2">
        <CreditCard class="size-16 mx-auto" />
        <h2>No payment histories found</h2>
        <p>No transactions have been recorded yet</p>
      </section>

      <!-- Payment History Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-secondary-background border-b border-border">
            <tr>
              <th class="text-left p-4 font-medium">User ID</th>
              <th class="text-left p-4 font-medium">Subscription</th>
              <th class="text-left p-4 font-medium">Amount</th>
              <th class="text-left p-4 font-medium">Payment Date</th>
              <th class="text-left p-4 font-medium">Stripe ID</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="payment in paymentHistories"
              :key="payment._id"
              class="border-b border-border hover:bg-secondary-background/50 transition-colors"
            >
              <td class="p-4">
                <div class="font-mono text-sm truncate max-w-32" :title="payment.userId">
                  {{ payment.userId }}
                </div>
              </td>
              <td class="p-4">
                <div class="space-y-1">
                  <div class="font-medium">{{ payment.subscriptionId.name }}</div>
                  <div class="text-sm text-muted-foreground">
                    {{ formatCurrency(payment.subscriptionId.price) }}/month
                  </div>
                </div>
              </td>
              <td class="p-4">
                <div class="font-medium text-green-600">
                  {{ formatCurrency(payment.amount) }}
                </div>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-2">
                  <Calendar class="size-4 text-muted-foreground" />
                  <span class="text-sm">{{ formatDate(payment.paymentDate) }}</span>
                </div>
              </td>
              <td class="p-4">
                <div
                  v-if="payment.stripeSubscriptionId"
                  class="font-mono text-sm truncate max-w-32"
                  :title="payment.stripeSubscriptionId"
                >
                  {{ payment.stripeSubscriptionId }}
                </div>
                <div v-else class="text-muted-foreground text-sm">N/A</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </section>
</template>
