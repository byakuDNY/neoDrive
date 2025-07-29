<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useProfile } from '@/composables/useProfile'
import { toTypedSchema } from '@vee-validate/zod'
import { Lock } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import * as z from 'zod'

const { changePassword, isChangingPassword, passwordError, clearErrors } = useProfile()

const passwordFormSchema = toTypedSchema(
  z
    .object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: z.string().min(8).max(32),
      confirmNewPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: "Passwords don't match",
      path: ['confirmNewPassword'],
    }),
)

const passwordForm = useForm({
  validationSchema: passwordFormSchema,
})

const onSubmit = passwordForm.handleSubmit(async (values) => {
  await changePassword(values.currentPassword, values.newPassword, values.confirmNewPassword)

  if (!passwordError.value) {
    passwordForm.resetForm()
  }
})

const onFormFocus = () => {
  clearErrors()
}
</script>

<template>
  <section class="bg-background border-2 border-border rounded-base shadow-shadow overflow-hidden">
    <div class="p-6 border-b border-border">
      <div class="flex items-center space-x-2 mb-2">
        <Lock class="size-5" />
        <h2 class="text-lg font-heading">Change Password</h2>
      </div>
      <p class="text-sm text-muted-foreground">Update your account password</p>
    </div>

    <div class="p-6">
      <form @submit.prevent="onSubmit" class="space-y-6">
        <FormField
          v-slot="{ componentField }"
          name="currentPassword"
          :validate-on-blur="!passwordForm.isFieldDirty"
        >
          <FormItem>
            <FormLabel>Current Password</FormLabel>
            <FormControl>
              <Input
                type="password"
                v-bind="componentField"
                placeholder="Enter current password"
                @focus="onFormFocus"
                :disabled="isChangingPassword"
                autocomplete="current-password"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          v-slot="{ componentField }"
          name="newPassword"
          :validate-on-blur="!passwordForm.isFieldDirty"
        >
          <FormItem>
            <FormLabel>New Password</FormLabel>
            <FormControl>
              <Input
                type="password"
                v-bind="componentField"
                placeholder="Enter new password"
                @focus="onFormFocus"
                :disabled="isChangingPassword"
                autocomplete="new-password"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          v-slot="{ componentField }"
          name="confirmNewPassword"
          :validate-on-blur="!passwordForm.isFieldDirty"
        >
          <FormItem>
            <FormLabel>Confirm New Password</FormLabel>
            <FormControl>
              <Input
                type="password"
                v-bind="componentField"
                placeholder="Confirm new password"
                @focus="onFormFocus"
                :disabled="isChangingPassword"
                autocomplete="new-password"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Server Error Display -->
        <div
          v-if="passwordError"
          class="text-sm text-red-500 bg-red-50 border border-red-200 rounded p-3"
        >
          {{ passwordError }}
        </div>

        <Button
          type="submit"
          :disabled="isChangingPassword || !passwordForm.meta.value.valid"
          class="w-full"
        >
          <Lock v-if="!isChangingPassword" class="size-4 mr-2" />
          <div v-else class="flex items-center">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          </div>
          {{ isChangingPassword ? 'Updating...' : 'Update Password' }}
        </Button>
      </form>
    </div>
  </section>
</template>
