import {
  BellIcon,
  BookTextIcon,
  CircleEllipsisIcon,
  HeartIcon,
  HomeIcon,
  ImageIcon,
  VideoIcon,
} from 'lucide-vue-next'

export const mainNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Images', href: '/dashboard/images', icon: ImageIcon },
  { name: 'Videos', href: '#', icon: VideoIcon },
  { name: 'Documents', href: '#', icon: BookTextIcon },
  { name: 'Others', href: '#', icon: CircleEllipsisIcon },
]

export const secondaryNavigation = [
  { name: 'Favorites', href: '/dashboard/favorites', icon: HeartIcon },
  { name: 'Subscriptions', href: '#', icon: BellIcon },
]
