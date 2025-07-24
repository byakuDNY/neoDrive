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
import type { SelectFile } from '@/lib/types'
import { useFileStore } from '@/stores/fileStore'
import { FolderPen } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'

const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  }),
)

const props = defineProps<{
  file: SelectFile | null
}>()

const isOpen = defineModel<boolean>('open')

const fileStore = useFileStore()
const formKey = ref(0) // Key to force form re-render

const currentFileName = computed(() => {
  if (!props.file) return ''

  if (props.file.type === 'file') {
    const lastDotIndex = props.file.name.lastIndexOf('.')
    return lastDotIndex > 0 ? props.file.name.substring(0, lastDotIndex) : props.file.name
  }

  return props.file.name
})

const fileExtension = computed(() => {
  if (!props.file || props.file.type === 'folder') return ''

  const lastDotIndex = props.file.name.lastIndexOf('.')
  return lastDotIndex > 0 ? props.file.name.substring(lastDotIndex) : ''
})

const initialValues = computed(() => ({
  name: currentFileName.value,
}))

// Force form to re-render when file changes
watch(
  () => props.file,
  () => {
    if (props.file) {
      formKey.value++
    }
  },
)

async function onSubmit(values: any) {
  if (!props.file) return

  try {
    const newName =
      props.file.type === 'file' ? `${values.name}${fileExtension.value}` : values.name

    await fileStore.renameFile(props.file, newName)
    isOpen.value = false
  } catch (error) {
    console.error('Failed to rename file:', error)
  }
}
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2 capitalize">
          <FolderPen />
          Rename {{ props.file?.type }}
        </DialogTitle>
      </DialogHeader>

      <Form
        v-if="props.file"
        :key="formKey"
        v-slot="{ handleSubmit }"
        :validation-schema="formSchema"
        :initial-values="initialValues"
      >
        <form id="renameForm" @submit="handleSubmit($event, onSubmit)">
          <FormField v-slot="{ componentField }" name="name">
            <FormItem>
              <FormLabel>{{ props.file?.type === 'folder' ? 'Folder' : 'File' }} Name</FormLabel>
              <FormControl>
                <div class="flex items-center gap-2">
                  <Input type="text" v-bind="componentField" placeholder="Enter name..." />
                  <span v-if="fileExtension" class="text-sm text-gray-500 whitespace-nowrap">
                    {{ fileExtension }}
                  </span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </form>

        <DialogFooter>
          <Button variant="neutral" @click="isOpen = false"> Cancel </Button>
          <Button type="submit" form="renameForm"> Rename </Button>
        </DialogFooter>
      </Form>
    </DialogContent>
  </Dialog>
</template>
