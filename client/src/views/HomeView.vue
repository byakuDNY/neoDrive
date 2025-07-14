<script setup lang="ts">
import PublicFooter from '@/components/PublicFooter.vue'
import PublicHeader from '@/components/PublicHeader.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { features, pricingPlans } from '@/lib/constants'
import { useAuthStore } from '@/stores/authStore'
import { Check } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

const { isAuthenticated } = useAuthStore()
</script>

<template>
  <PublicHeader />

  <main>
    <section class="relative py-20 lg:py-32">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl md:text-6xl font-heading mb-6">
          Your Files, <span class="text-main">Anywhere</span>
        </h1>
        <p class="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-foreground/80">
          Store, sync, and share your files securely with neoDrive. The modern cloud storage
          solution built for everyone.
        </p>

        <Button class="mb-12 text-lg px-8 py-6" asChild>
          <RouterLink :to="isAuthenticated ? '/dashboard' : '/signup'">
            {{ isAuthenticated ? 'Go to Dashboard' : 'Start Free Today' }}
          </RouterLink>
        </Button>
      </div>
    </section>

    <section class="py-20 bg-secondary-background">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-heading mb-4">Everything You Need</h2>
          <p class="text-xl text-foreground/80 max-w-2xl mx-auto">
            Powerful features designed to make file management effortless
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="feature in features"
            class="bg-background border-2 border-border rounded-base shadow-shadow p-6 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
          >
            <div class="flex items-center gap-4 mb-4">
              <div class="p-3 bg-main/10 border-2 border-main rounded-base">
                <component :is="feature.icon" class="text-main" />
              </div>
              <h3 class="text-xl font-heading">{{ feature.title }}</h3>
            </div>
            <p class="text-foreground/80">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="py-20">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-heading mb-4">Simple, Transparent Pricing</h2>
          <p class="text-xl text-foreground/80 max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include our core features.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card
            v-for="plan in pricingPlans"
            :class="[
              'relative border-2 border-border rounded-base shadow-shadow',
              plan.popular ?? 'border-main scale-105',
            ]"
          >
            <div
              v-if="plan.popular"
              class="absolute -top-4 md:-top-10 lg:-top-4 left-1/2 transform -translate-x-1/2"
            >
              <div
                class="bg-main text-main-foreground px-4 py-2 rounded-base border-2 border-border shadow-shadow text-sm font-base"
              >
                Most Popular
              </div>
            </div>

            <CardHeader class="text-center pb-6">
              <CardTitle class="text-2xl font-heading">{{ plan.name }}</CardTitle>
              <div class="flex items-baseline justify-center gap-2 my-4">
                <span class="text-4xl font-heading">{{ plan.price }}</span>
                <span class="text-foreground/60">{{ plan.period }}</span>
              </div>
              <CardDescription class="text-base">{{ plan.description }}</CardDescription>
            </CardHeader>

            <CardContent class="space-y-6 flex flex-col h-full justify-between">
              <div class="space-y-3">
                <div v-for="feature in plan.features" :key="feature" class="flex items-start gap-3">
                  <Check class="size-5 text-main mt-0.5 flex-shrink-0" />
                  <span class="text-sm">{{ feature }}</span>
                </div>
              </div>

              <Button
                :variant="plan.popular ? 'default' : 'neutral'"
                class="w-full py-6 text-base"
                asChild
              >
                <RouterLink :to="isAuthenticated ? '/dashboard' : '/signup'">
                  {{ plan.cta }}
                </RouterLink>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>

    <section class="py-20">
      <div class="container mx-auto px-4 text-center">
        <div class="max-w-4xl mx-auto">
          <h2 class="text-3xl md:text-4xl font-heading mb-6">Ready to Get Started?</h2>
          <p class="text-xl text-foreground/80 mb-8">
            Join thousands of users who trust neoDrive with their important files. Start your free
            account today.
          </p>

          <Button size="lg" class="text-lg px-8 py-6" asChild>
            <RouterLink :to="isAuthenticated ? '/dashboard' : '/signup'">
              {{ isAuthenticated ? 'Go to Dashboard' : 'Create Free Account' }}
            </RouterLink>
          </Button>
        </div>
      </div>
    </section>
  </main>

  <PublicFooter />
</template>
