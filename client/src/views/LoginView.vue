<script setup lang="ts">
import AuthForm from '@/components/AuthForm.vue'
import PublicHeader from '@/components/PublicHeader.vue'
</script>

<template>
  <PublicHeader :show-call-to-action="false" />

  <!-- Mobile layout -->
  <div class="lg:hidden">
    <div class="container mx-auto px-4 py-8">
      <div class="text-center mb-8">
        <div class="space-y-2">
          <h2 class="text-3xl">Welcome back to neoDrive</h2>
          <p class="text-lg">Your <span class="text-main">neo</span> cloud storage solution</p>
        </div>
      </div>
      <AuthForm type="LOGIN" />
    </div>
  </div>

  <!-- Desktop layout -->
  <div class="hidden lg:block">
    <div class="grid lg:grid-cols-5 min-h-[calc(100vh-64px)]">
      <!-- Right side - Form -->
      <div
        class="w-full lg:col-span-3 flex items-center justify-center p-8 bg-secondary-background/60"
      >
        <AuthForm type="LOGIN" />
      </div>

      <!-- Left side - Image -->
      <div class="lg:col-span-2">
        <div class="flex items-center justify-center h-full p-12">
          <div class="text-center space-y-6">
            <img
              src="/login-image.svg"
              alt="Sign up illustration"
              class="w-full max-w-md mx-auto object-contain drop-shadow-lg drop-shadow-green-500"
            />
            <div class="space-y-2">
              <h2 class="text-3xl">Welcome back to neoDrive</h2>
              <p class="text-lg">Your <span class="text-main">neo</span> cloud storage solution</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
