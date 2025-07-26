<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useProfile } from '@/composables/useProfile'
import { useAuthStore } from '@/stores/authStore'
import { toTypedSchema } from '@vee-validate/zod'
import { Lock, Save, User } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import * as z from 'zod'

const authStore = useAuthStore()
const {
  changeName,
  changePassword,
  isChangingName,
  isChangingPassword,
  nameError,
  passwordError,
  clearErrors,
} = useProfile()

// Name form schema and setup
const nameFormSchema = toTypedSchema(
  z.object({
    newName: z.string().min(2).max(32),
  }),
)

const nameForm = useForm({
  validationSchema: nameFormSchema,
  initialValues: {
    newName: authStore.session?.name || '',
  },
})

// Password form schema and setup
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

const onNameSubmit = nameForm.handleSubmit(async (values) => {
  const success = await changeName(values.newName)
  if (success) {
    // Update form with new name
    nameForm.setFieldValue('newName', values.newName)
  }
})

const onPasswordSubmit = passwordForm.handleSubmit(async (values) => {
  const success = await changePassword(
    values.currentPassword,
    values.newPassword,
    values.confirmNewPassword,
  )
  if (success) {
    // Clear form on success
    passwordForm.resetForm()
  }
})

const onFormFocus = () => {
  clearErrors()
}
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
        <p class="text-muted-foreground">Manage your account settings and preferences</p>
        <p class="text-sm text-muted-foreground">Welcome back, {{ authStore.session?.name }}</p>
      </div>
    </div>

    <!-- Content -->
    <div class="grid gap-6 md:grid-cols-2">
      <!-- Change Name Section -->
      <section
        class="bg-background border-2 border-border rounded-base shadow-shadow overflow-hidden"
      >
        <div class="p-6 border-b border-border">
          <div class="flex items-center space-x-2 mb-2">
            <User class="size-5" />
            <h2 class="text-lg font-heading">Change Name</h2>
          </div>
          <p class="text-sm text-muted-foreground">Update your display name</p>
        </div>

        <div class="p-6">
          <form @submit.prevent="onNameSubmit" class="space-y-6">
            <div>
              <label class="text-sm font-medium text-muted-foreground">Current Name</label>
              <Input :value="authStore.session?.name" disabled class="bg-muted mt-1" />
            </div>

            <FormField
              v-slot="{ componentField }"
              name="newName"
              :validate-on-blur="!nameForm.isFieldDirty"
            >
              <FormItem>
                <FormLabel>New Name</FormLabel>
                <FormControl>
                  <Input
                    v-bind="componentField"
                    placeholder="Enter new name"
                    @focus="onFormFocus"
                    :disabled="isChangingName"
                    autocomplete="name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Server Error Display -->
            <div
              v-if="nameError"
              class="text-sm text-red-500 bg-red-50 border border-red-200 rounded p-3"
            >
              {{ nameError }}
            </div>

            <Button
              type="submit"
              :disabled="
                isChangingName ||
                !nameForm.meta.value.valid ||
                nameForm.values.newName === authStore.session?.name
              "
              class="w-full"
            >
              <Save v-if="!isChangingName" class="size-4 mr-2" />
              <div v-else class="flex items-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              </div>
              {{ isChangingName ? 'Updating...' : 'Update Name' }}
            </Button>
          </form>
        </div>
      </section>

      <!-- Change Password Section -->
      <section
        class="bg-background border-2 border-border rounded-base shadow-shadow overflow-hidden"
      >
        <div class="p-6 border-b border-border">
          <div class="flex items-center space-x-2 mb-2">
            <Lock class="size-5" />
            <h2 class="text-lg font-heading">Change Password</h2>
          </div>
          <p class="text-sm text-muted-foreground">Update your account password</p>
        </div>

        <div class="p-6">
          <form @submit.prevent="onPasswordSubmit" class="space-y-6">
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
    </div>
  </section>
</template>
