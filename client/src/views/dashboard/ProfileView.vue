<script setup lang="ts">
import ChangeNameForm from '@/components/profile/ChangeNameForm.vue'
import ChangePasswordForm from '@/components/profile/ChangePasswordForm.vue'
import { User } from 'lucide-vue-next'
</script>

<template>
  <section class="p-4 md:p-8">
    <!-- Header -->
    <div class="flex items-center space-x-4 mb-6">
      <div class="p-3 bg-background border-2 border-border rounded-base shadow-shadow">
        <User class="text-main size-8" />
      </div>
      <div>
        <h1 class="text-2xl font-heading">Profile Settings</h1>
        <p class="text-muted-foreground">Manage your account settings</p>
      </div>
    </div>

    <!-- Content -->
    <div class="grid gap-6 md:grid-cols-2">
      <ChangeNameForm />
      <ChangePasswordForm />
    </div>
  </section>
</template>
