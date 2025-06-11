<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { User } from '@/lib/types'
import { getInitials } from '@/lib/utils'
import { LogOut } from 'lucide-vue-next'
import ModeToggle from './ModeToggle.vue'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Input } from './ui/input'

const props = defineProps<{
  user: User
}>()
</script>

<template>
  <header class="border-b-4">
    <div class="flex justify-between p-4 space-x-2">
      <div></div>

      <Input placeholder="Search..." class="max-w-60 lg:max-w-96" />

      <div class="space-x-4 flex items-center">
        <ModeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger class="cursor-pointer" as-child>
            <Avatar class="size-10">
              <AvatarImage :src="props.user.avatar" alt="avatar" class="object-cover" />
              <AvatarFallback>{{ getInitials(props.user.name) }}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-56" align="end">
            <DropdownMenuLabel>
              <div class="flex items-center gap-2 px-1 py-1.5">
                <Avatar class="size-8 overflow-hidden rounded-full">
                  <AvatarImage :src="props.user.avatar" alt="avatar" class="object-cover" />
                  <AvatarFallback class="">{{ getInitials(props.user.name) }}</AvatarFallback>
                </Avatar>
                <div class="flex flex-col text-left">
                  <span class="truncate text-base font-medium">{{ props.user.name }}</span>
                  <span class="truncate text-xs">{{ props.user.email }}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <span>Profile</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </header>
</template>
