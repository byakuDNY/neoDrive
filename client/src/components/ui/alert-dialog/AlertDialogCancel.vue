<script setup lang="ts">
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { reactiveOmit } from '@vueuse/core'
import { AlertDialogCancel, type AlertDialogCancelProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

const props = defineProps<AlertDialogCancelProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = reactiveOmit(props, 'class')
</script>

<template>
  <AlertDialogCancel
    v-bind="delegatedProps"
    :class="cn(buttonVariants({ variant: 'neutral' }), 'mt-2 sm:mt-0', props.class)"
  >
    <slot />
  </AlertDialogCancel>
</template>
