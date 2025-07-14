<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Folder } from 'lucide-vue-next'
import { ref } from 'vue'

const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(1).max(50),
  }),
)

defineProps<{
  isUploading: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', name: string): void
}>()

const isOpen = ref(false)

function onSubmit(values: any) {
  emit('submit', values.name)
  isOpen.value = false
}
</script>

<template>
  <Form v-slot="{ handleSubmit }" as="" keep-values :validation-schema="formSchema">
    <Dialog v-model:open="isOpen">
      <DialogTrigger as-child>
        <Button class="cursor-pointer" :disabled="isUploading">
          <Folder />
          {{ isUploading ? 'Uploading...' : 'Upload Folder' }}
        </Button>
      </DialogTrigger>
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Folder</DialogTitle>
        </DialogHeader>

        <form id="dialogForm" @submit="handleSubmit($event, onSubmit)">
          <FormField v-slot="{ componentField }" name="name">
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Images" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </form>

        <DialogFooter>
          <Button type="submit" form="dialogForm">Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </Form>
</template>
