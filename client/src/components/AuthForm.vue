<script setup lang="ts">
// import { vAutoAnimate } from '@formkit/auto-animate/vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useForm } from 'vee-validate'
import { computed } from 'vue'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'

const props = defineProps<{
  type: 'SIGNUP' | 'LOGIN'
}>()

const isSignup = computed(() => {
  return props.type === 'SIGNUP' ? true : false
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

const onSubmit = form.handleSubmit((values) => {
  console.log(values)
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
      <form class="space-y-6" @submit="onSubmit" @change="() => console.log(form.errors.value)">
        <FormField
          v-if="isSignup"
          v-slot="{ componentField }"
          name="name"
          :validate-on-blur="!form.isFieldDirty"
        >
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input type="text" placeholder="Jane Doe" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="email" :validate-on-blur="!form.isFieldDirty">
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="jane@example.com" v-bind="componentField" />
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
              <Input type="password" v-bind="componentField" />
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
              <Input type="password" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <Button type="submit" class="w-full">{{ isSignup ? 'Sign up' : 'Login' }}</Button>
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
