<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useProfile } from '@/composables/useProfile'
import { useAuthStore } from '@/stores/authStore'
import { toTypedSchema } from '@vee-validate/zod'
import { Loader2, Save, User } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import * as z from 'zod'

const authStore = useAuthStore()
const { changeName, isChangingName, nameError, clearErrors } = useProfile()

const nameFormSchema = toTypedSchema(
  z.object({
    newName: z.string().min(2).max(32),
  }),
)

const nameForm = useForm({
  validationSchema: nameFormSchema,
  initialValues: {
    newName: authStore.session?.name,
  },
})

// onMounted(() => {
//   nameForm.setFieldValue('newName', authStore.session?.name)
// })

const onSubmit = nameForm.handleSubmit(async (values) => {
  await changeName(values.newName)
})

const onFormFocus = () => {
  clearErrors()
}
</script>

<template>
  <section class="bg-background border-2 border-border rounded-base shadow-shadow overflow-hidden">
    <div class="p-6 border-b border-border">
      <div class="flex items-center space-x-2 mb-2">
        <User />
        <h2 class="text-lg font-heading">Change Name</h2>
      </div>
      <p class="text-sm text-gray-500">Update your display name</p>
    </div>

    <div class="p-6">
      <form @submit.prevent="onSubmit" class="space-y-6">
        <div>
          <Label>Current Name</Label>
          <Input
            :value="authStore.session?.name"
            disabled
            class="bg-transparent text-gray-500 mt-1"
          />
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
          <Save v-if="!isChangingName" />
          <Loader2 v-else class="animate-spin" />
          {{ isChangingName ? 'Updating...' : 'Update Name' }}
        </Button>
      </form>
    </div>
  </section>
</template>
