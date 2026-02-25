import { createRouter, createWebHistory } from 'vue-router'

import Login from '../screens/Login.vue'
import Register from '../screens/Register.vue'
import Loading from '../screens/Loading.vue'
import Lobby from '../screens/Lobby.vue'
import Game from '../screens/Game.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },

    { path: '/login', name: 'login', component: Login },
    { path: '/register', name: 'register', component: Register },

    { path: '/loading', name: 'loading', component: Loading, meta: { requiresAuth: true } },
    { path: '/lobby', name: 'lobby', component: Lobby, meta: { requiresAuth: true } },
    { path: '/game', name: 'game', component: Game, meta: { requiresAuth: true } },
  ],
})

router.beforeEach((to) => {
  const token = localStorage.getItem('fz_token')

  if (to.meta.requiresAuth && !token) return '/login'
  if ((to.path === '/login' || to.path === '/register') && token) return '/lobby'
})

export default router