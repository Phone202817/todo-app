import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import { auth, db } from '../../firebase/config'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

const router = createRouter({
  history: createWebHistory(),
  routes,
})

function getCurrentUser(): Promise<User | null> {
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

    const publicPages = ['/login', '/register']

    if (user && publicPages.includes(to.path)) {
      return next('/overview')
    }

    if (to.meta.requiresAuth && !user) {
      return next('/login')
    }

    if (to.meta.requiresAdmin) {
      const snap = await getDoc(doc(db, "users", user!.uid))
      const data = snap.data()

      if (data?.role !== "admin") {
        return next('/overview') 
      }
    }

    next()
  } catch (err) {
    if (to.meta.requiresAdmin) {
      return next('/overview')
    }
    if (to.meta.requiresAuth) {
      return next('/login')
    }
    next()
  }
})

export default router
