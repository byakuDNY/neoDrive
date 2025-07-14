import DashboardLayout from '@/layout/DashboardLayout.vue'
import { useAuthStore } from '@/stores/authStore'
import CategoryView from '@/views/dashboard/CategoryView.vue'
import DashboardView from '@/views/dashboard/DashboardView.vue'
import SubcriptionView from '@/views/dashboard/SubcriptionView.vue'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import SignupView from '@/views/SignupView.vue'
import {
  CircleEllipsisIcon,
  FileImageIcon,
  FileMusicIcon,
  FileTextIcon,
  FileVideoIcon,
  HeartIcon,
} from 'lucide-vue-next'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: 'Home',
      path: '/',
      component: HomeView,
    },
    {
      name: 'Login',
      path: '/login',
      component: LoginView,
    },
    {
      name: 'Signup',
      path: '/signup',
      component: SignupView,
    },
    {
      path: '/dashboard',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: DashboardView,
        },
        {
          path: 'images',
          name: 'Images',
          component: CategoryView,
          props: { category: 'images', icon: FileImageIcon },
        },
        {
          path: 'videos',
          name: 'Videos',
          component: CategoryView,
          props: { category: 'videos', icon: FileVideoIcon },
        },
        {
          path: 'audios',
          name: 'Audios',
          component: CategoryView,
          props: { category: 'audios', icon: FileMusicIcon },
        },
        {
          path: 'documents',
          name: 'Documents',
          component: CategoryView,
          props: { category: 'documents', icon: FileTextIcon },
        },
        {
          path: 'others',
          name: 'Others',
          component: CategoryView,
          props: { category: 'others', icon: CircleEllipsisIcon },
        },
        {
          path: 'favorites',
          name: 'Favorites',
          component: CategoryView,
          props: { category: 'favorites', icon: HeartIcon },
        },
        {
          path: 'subscriptions',
          name: 'Subscriptions',
          component: SubcriptionView,
        },
      ],
    },
  ],
})

router.beforeEach((to, from, next) => {
  const { isAuthenticated } = useAuthStore()

  if ((to.name === 'Login' || to.name === 'Signup') && isAuthenticated) {
    next({ name: 'Dashboard' })
  } else if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' })
  } else {
    next()
  }
})

export default router
