<script setup lang="ts">
import happyAnnouncementImage from '@/assets/happy-announcement-image.svg'
import AuthForm from '@/components/AuthForm.vue'
import PublicHeader from '@/components/PublicHeader.vue'
</script>

<template>
  <div>
    <PublicHeader :show-call-to-action="false" />

    <!-- Mobile layout -->
    <div class="lg:hidden">
      <div class="container mx-auto px-4 py-8">
        <div class="text-center mb-8">
          <div class="space-y-2">
            <h2 class="text-3xl">Welcome to neoDrive</h2>
            <p class="text-lg">Your <span class="text-main">neo</span> cloud storage solution</p>
          </div>
        </div>
        <AuthForm type="SIGNUP" />
      </div>
    </div>

    <!-- Desktop layout -->
    <div class="hidden lg:block">
      <div class="grid lg:grid-cols-5 min-h-[calc(100vh-64px)]">
        <!-- Left side - Image -->
        <div class="lg:col-span-2">
          <div class="flex items-center justify-center h-full p-12">
            <div class="text-center space-y-6">
              <img
                :src="happyAnnouncementImage"
                alt="Sign up illustration"
                class="w-full max-w-md mx-auto object-contain drop-shadow-lg drop-shadow-green-500"
              />
              <div class="space-y-2">
                <h2 class="text-3xl">Welcome to neoDrive</h2>
                <p class="text-lg">
                  Your <span class="text-main">neo</span> cloud storage solution
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right side - Form -->
        <div
          class="w-full lg:col-span-3 flex items-center justify-center p-8 bg-secondary-background/60"
        >
          <AuthForm type="SIGNUP" />
        </div>
      </div>
    </div>
  </div>
</template>
