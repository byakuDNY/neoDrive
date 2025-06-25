import { useAuthStore } from '@/stores/auth'
import HomeView from '@/views/HomeView.vue'
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
      component: () => import('../views/LoginView.vue'),
    },
    {
      name: 'Signup',
      path: '/signup',
      component: () => import('../views/SignupView.vue'),
    },
    {
      path: '/dashboard',
      component: () => import('../views/dashboard/DashboardLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          name: 'Dashboard',
          path: '',
          component: () => import('../views/dashboard/DashboardView.vue'),
        },
        {
          name: 'Images',
          path: 'images',
          component: () => import('../views/dashboard/ImagesView.vue'),
        },
        // {
        //   path: 'videos',
        //   component: () => import('../views/dashboard/VideosView.vue'),
        // },
        // {
        //   path: 'documents',
        //   component: () => import('../views/dashboard/DocumentsView.vue'),
        // },
        // {
        //   path: 'others',
        //   component: () => import('../views/dashboard/OthersView.vue'),
        // },
        {
          name: 'Favorites',
          path: 'favorites',
          component: () => import('../views/dashboard/FavoritesView.vue'),
        },
        // {
        //   path: 'subscriptions',
        //   component: () => import('../views/dashboard/SubscriptionsView.vue'),
        // }
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
