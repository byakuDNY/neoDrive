<script setup lang="ts">
import { cn } from '@/lib/utils'
import { reactiveOmit } from '@vueuse/core'
import { AlertDialogDescription, type AlertDialogDescriptionProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

const props = defineProps<AlertDialogDescriptionProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = reactiveOmit(props, 'class')
</script>

<template>
  <AlertDialogDescription
    data-slot="alert-dialog-description"
    v-bind="delegatedProps"
    :class="cn('text-sm font-base text-foreground', props.class)"
  >
    <slot />
  </AlertDialogDescription>
</template>
