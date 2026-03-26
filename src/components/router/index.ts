import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import { auth } from '../../firebase/config'
import { onAuthStateChanged } from 'firebase/auth'

const router = createRouter({
  history: createWebHistory(),
  routes,
})

function getCurrentUser() {
  return new Promise((resolve, reject) => {
    const remove = onAuthStateChanged(
      auth,
      (user) => {
        remove()
        resolve(user)
      },
      (err) => {
        remove()
        reject(err)
      }
    )
  })
}

router.beforeEach(async (to, _from, next) => {
  try {
    const user = await getCurrentUser()
    // If the user is authenticated and tries to access login/register, redirect to app
    const publicPages = ['/login', '/register']
    if (user && publicPages.includes((to as any).path)) {
      next('/usermanage')
      return
    }

    if ((to as any).meta.requiresAuth && !user) {
      next('/login')
    } else {
      next()
    }
  } catch (err) {
    next()
  }
})

export default router