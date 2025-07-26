<script setup lang="ts">
import { cn } from '@/lib/utils'
import { SelectLabel, type SelectLabelProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

const props = defineProps<SelectLabelProps & { class?: HTMLAttributes['class'] }>()
</script>

<template>
  <SelectLabel
    data-slot="select-label"
    :class="
      cn(
        'border-2 border-transparent py-1.5 pr-8 pl-2 text-sm font-base text-main-foreground/80',
        props.class,
      )
    "
  >
    <slot />
  </SelectLabel>
</template>
