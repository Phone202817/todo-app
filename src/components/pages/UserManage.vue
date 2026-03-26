<template>
    <v-card class="tabmenu pa-4">
        <v-card-title class="text-h5">User Management</v-card-title>

        <v-row class="align-center mb-4">
            <v-col cols="12" md="6">
                <v-text-field
                    v-model="search"
                    label="Search"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    hide-details
                    single-line
                ></v-text-field>
            </v-col>
            <v-col cols="12" md="6" class="text-right">
                <v-btn prepend-icon="mdi-account-plus" color="primary" @click="onAddUser">Add User</v-btn>
            </v-col>
        </v-row>

        <v-row dense>
            <v-col cols="12" v-if="loading">
                <v-skeleton-loader type="card" />
            </v-col>

            <v-col v-for="user in filteredUsers" :key="user.id" cols="12" sm="6" md="4" lg="3">
                <v-card class="user-card pa-4">
                    <v-row class="align-center">
                        <v-col cols="3" class="text-center">
                            <v-avatar size="64" class="mx-auto" color="primary" tile>
                                <span class="white--text text-h6">{{ (user.name || '?').charAt(0).toUpperCase() }}</span>
                            </v-avatar>
                        </v-col>
                        <v-col cols="9">
                            <div class="text-h6 font-weight-medium">{{ user.name }}</div>
                            <div class="text-caption text--secondary">{{ user.email }}</div>
                            <div class="mt-2">
                                <v-chip small :color="user.status === 'active' ? 'green lighten-2' : 'grey lighten-1'">
                                    {{ user.status || 'inactive' }}
                                </v-chip>
                                <v-chip small class="ml-2" color="blue lighten-4" text-color="blue--text">
                                    {{ user.role || 'User' }}
                                </v-chip>
                            </div>
                        </v-col>
                    </v-row>

                    <v-divider class="my-3"></v-divider>

                    <v-card-actions>
                        <v-btn text small color="primary" @click="onEdit(user.id)">Edit</v-btn>
                        <v-spacer></v-spacer>
                        <v-btn text small color="error" @click="onDelete(user.id)">Delete</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>

            <v-col cols="12" v-if="!loading && filteredUsers.length === 0" class="text-center">
                <div class="text-subtitle-1">ไม่มีผู้ใช้ที่ตรงกับการค้นหา</div>
            </v-col>
        </v-row>
    </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { collection, query, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase/config'

interface User {
  id: string
  name?: string
  email?: string
  role?: string
  status?: 'active' | 'inactive' | string
}

const search = ref('')
const users = ref<User[]>([])
const loading = ref(true)

let unsub: (() => void) | null = null

onMounted(() => {
  try {
    // 🔥 เอา orderBy ออกก่อน (กันพัง)
    const q = query(collection(db, 'users'))

    unsub = onSnapshot(
      q,
      snapshot => {
        console.log('RAW DATA:', snapshot.docs.map(d => d.data())) // 🔥 debug

        users.value = snapshot.docs.map(d => {
          const data = d.data() as any

          return {
            id: d.id,
            name: data.name ?? '',
            email: data.email ?? '',
            role: data.role ?? 'User',
            status: data.status ?? 'inactive'
          }
        })

        loading.value = false
      },
      err => {
        console.error('🔥 Firestore error:', err)
        loading.value = false
      }
    )
  } catch (err) {
    console.error('🔥 Setup error:', err)
    loading.value = false
  }
})

onUnmounted(() => {
  if (unsub) unsub()
})

const filteredUsers = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return users.value

  return users.value.filter(u =>
    (u.name || '').toLowerCase().includes(q) ||
    (u.email || '').toLowerCase().includes(q) ||
    (u.role || '').toLowerCase().includes(q)
  )
})

function onAddUser() {
  console.log('Add user')
}

function onEdit(id: string) {
  console.log('Edit user', id)
}

function onDelete(id: string) {
  console.log('Delete user', id)
}
</script>

<style scoped>
@import "../css/usermanage.css";
</style>