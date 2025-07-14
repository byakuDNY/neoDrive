<script setup lang="ts">
// import { vAutoAnimate } from '@formkit/auto-animate/vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/authStore'
import { Icon } from '@iconify/vue'
import { useForm } from 'vee-validate'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'

const router = useRouter()

const submitError = ref('')
const loading = ref(false)

const { type } = defineProps<{
  type: 'SIGNUP' | 'LOGIN'
}>()

const isSignup = computed(() => {
  return type === 'SIGNUP' ? true : false
})

const formSchema = toTypedSchema(
  isSignup.value
    ? z
        .object({
          name: z.string().min(2).max(32),
          email: z.string().email(),
          password: z.string().min(8).max(32),
          confirmPassword: z.string().min(8).max(32),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: "Passwords don't match",
          path: ['confirmPassword'],
        })
    : z.object({
        email: z.string().email(),
        password: z.string().min(8).max(32),
      }),
)

const form = useForm({
  validationSchema: formSchema,
})

const onSubmit = form.handleSubmit(async (values) => {
  loading.value = true
  const authType = isSignup.value ? 'signup' : 'login'
  try {
    const response = await fetch(`/api/auth/${authType}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(values),
    })

    const { message, data: userData } = await response.json()
    if (!response.ok) {
      submitError.value = message ?? 'An unexpected error occurred while processing your request'
      console.error(response)
    }

    if (!isSignup.value) {
      const { setSession } = useAuthStore()
      setSession(userData)
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  } catch (error) {
    submitError.value = 'An unexpected error occurred while processing your request'
    console.error(error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <Card class="container mx-auto max-w-lg">
    <CardHeader>
      <CardTitle>{{ isSignup ? 'Sign up' : 'Login' }}</CardTitle>
      <CardDescription>{{
        isSignup ? 'Create an account' : 'Log in to your account'
      }}</CardDescription>
    </CardHeader>

    <CardContent>
      <form
        class="space-y-6"
        @submit.prevent="onSubmit"
        @change="() => console.log(form.errors.value)"
      >
        <FormField
          v-if="isSignup"
          v-slot="{ componentField }"
          name="name"
          :validate-on-blur="!form.isFieldDirty"
        >
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

        <FormField v-slot="{ componentField }" name="email" :validate-on-blur="!form.isFieldDirty">
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="jane@example.com"
                v-bind="componentField"
                autocomplete="email"
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

        <FormField
          v-if="isSignup"
          v-slot="{ componentField }"
          name="confirmPassword"
          :validate-on-blur="!form.isFieldDirty"
        >
          <FormItem>
            <FormLabel>Confirm Password</FormLabel>
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

          <span v-else>{{ isSignup ? 'Sign up' : 'Login' }}</span>
        </Button>

        <div v-if="submitError" class="text-center text-lg font-base text-red-500">
          {{ submitError }}
        </div>
      </form>
    </CardContent>

    <CardFooter class="flex-col gap-2">
      <div class="mt-4 text-center text-sm">
        {{ isSignup ? 'Already have an account?' : "Don't have an account?" }}
        <RouterLink :to="isSignup ? '/login' : '/signup'" class="underline underline-offset-4">
          {{ isSignup ? 'Login' : 'Sign up' }}
        </RouterLink>
      </div>
    </CardFooter>
  </Card>
</template>
