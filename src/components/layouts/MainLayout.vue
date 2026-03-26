<template>
  <v-layout>
    <!-- 🔥 Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      color="indigo"
      permanent
    >
      <!-- Header -->
      <v-list>
        <v-list-item title="Todo App">
          <template #append>
            <v-btn
              icon="mdi-chevron-left"
              variant="text"
              @click.stop="rail = !rail"
            />
          </template>
        </v-list-item>
      </v-list>

      <v-divider />

      <!-- Menu -->
      <v-list density="compact" nav>
        <v-list-item
          v-for="item in items"
          :key="item.path"
          :prepend-icon="item.icon"
          :title="item.title"
          @click="goTo(item.path)"
        />
      </v-list>
    </v-navigation-drawer>

    <!-- 🔥 Main Content -->
    <v-main>
      <router-view />
    </v-main>
  </v-layout>
</template>


<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { computed } from "vue"
import { currentUser } from "../composables/useAuth"
import { signOut } from 'firebase/auth'
import { auth } from '../../firebase/config'

const router = useRouter()

const drawer = ref(true)
const rail = ref(true)



const items = computed(() => {
  return [
    { icon: 'mdi-chart-bar', title: 'Overview', path: '/overview' },

    ...(currentUser.value?.role === "admin"
      ? [{ icon: 'mdi-account', title: 'User Manage', path: '/usermanage' }]
      : []),

    { icon: 'mdi-logout', title: 'Logout', path: '/login' },
  ]
})

// 🔥 ฟังก์ชันเปลี่ยนหน้า
const goTo = async (path: string) => {
  if (path === '/login') {
    // treat navigating to /login from the menu as logout
    await logout()
    return
  }

  router.push(path)
}


const logout = async () => {
  try {
    await signOut(auth)
  } catch (e) {
    console.error('Sign out failed', e)
  } finally {
    router.push('/login')
  }
}
</script>