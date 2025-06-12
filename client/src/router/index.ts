import HomeView from '@/views/HomeView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: HomeView,
    },
    {
      path: '/login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/signup',
      component: () => import('../views/SignupView.vue'),
    },
    {
      path: '/dashboard',
      component: () => import('../views/dashboard/DashboardLayout.vue'),
      children: [
        {
          path: '',
          component: () => import('../views/dashboard/DashboardView.vue'),
        },
        {
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

export default router
