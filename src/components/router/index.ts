import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import { auth } from '../../firebase/config'

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const user = auth.currentUser

  if (to.meta.requiresAuth && !user) {
    next('/login')
  } else {
    next()
  }
})

export default router