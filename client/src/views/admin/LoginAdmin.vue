<script setup lang="ts">
// import { vAutoAnimate } from '@formkit/auto-animate/vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/authStore'
import { Icon } from '@iconify/vue'
import { useForm } from 'vee-validate'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const authStore = useAuthStore()

const submitError = ref('')
const loading = ref(false)

const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(2).max(32),
    password: z.string().min(8).max(32),
  }),
)

const form = useForm({
  validationSchema: formSchema,
})

const onSubmit = form.handleSubmit(async (values) => {
  loading.value = true
  submitError.value = ''
  try {
    const response = await fetch(`/api/auth/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(values),
    })

    const { message, data: adminData } = await response.json()
    if (!response.ok) {
      submitError.value = message ?? 'An unexpected error occurred while processing your request'
      console.error(response)
      return
    }

    authStore.setAdminSession(adminData)

    router.push('/admin/dashboard')
  } catch (error) {
    submitError.value = 'An unexpected error occurred while processing your request'
    console.error(error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="h-dvh flex justify-center items-center">
    <Card class="container mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>Admin Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          class="space-y-6"
          @submit.prevent="onSubmit"
          @change="() => console.log(form.errors.value)"
        >
          <FormField v-slot="{ componentField }" name="name" :validate-on-blur="!form.isFieldDirty">
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Jane Doe"
                  v-bind="componentField"
                  autocomplete="name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField
            v-slot="{ componentField }"
            name="password"
            :validate-on-blur="!form.isFieldDirty"
          >
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" v-bind="componentField" autocomplete="current-password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <Button type="submit" :disabled="loading" class="w-full">
            <span v-if="loading" class="flex items-center space-x-2">
              <Icon icon="fa6-solid:spinner" class="animate-spin" />
              <span>Loading...</span>
            </span>
            <span v-else>Login</span>
          </Button>
          <div v-if="submitError" class="text-center text-lg font-base text-red-500">
            {{ submitError }}
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
