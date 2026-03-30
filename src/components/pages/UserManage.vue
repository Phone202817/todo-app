<template>
  <!-- หน้านี้สำหรับจัดการผู้ใช้:
       - ส่วนหัว: ชื่อหน้า + ปุ่ม Add User
       - ช่องค้นหา: filter ตามชื่อ/อีเมล
       - การ์ดผู้ใช้: แสดงชื่อ อีเมล บทบาท (role) และสถานะ (มีสีบอกสถานะ)
       - Dialog: ฟอร์มเพิ่ม/แก้ไขผู้ใช้
       - Snackbar: แจ้งข้อผิดพลาดเมื่อสิทธิ์ไม่พอหรือคำสั่งล้มเหลว -->
  <v-container fluid>
    <v-card class="pa-6 rounded-xl elevation-3">

      <!-- 🔥 Header -->
      <div class="d-flex justify-space-between align-center mb-4">
        <div class="text-h5 font-weight-bold">User Management</div>
        <v-btn color="primary" @click="openAdd">Add User</v-btn>
      </div>

      <!-- 🔍 Search -->
      <v-text-field v-model="search" label="Search user..." prepend-inner-icon="mdi-magnify" variant="outlined"
        class="mb-4" />

      <!-- 📋 Users -->
      <v-row>
        <v-col v-for="user in paginatedUsers" :key="user.id" cols="12" sm="6" md="4" lg="3">
          <v-card class="user-card pa-4">

            <!-- Avatar -->
            <div class="text-center mb-2">
              <v-avatar size="60" color="primary">
                {{ user.name.charAt(0).toUpperCase() }}
              </v-avatar>
            </div>

            <!-- Info -->
            <div class="text-center">
              <div class="text-subtitle-1 font-weight-medium">
                {{ user.name }}
              </div>
              <div class="text-caption text-grey">
                {{ user.email }}
              </div>
              <v-chip size="small" color="blue" class="mt-2">
                {{ user.role || 'User' }}
              </v-chip>
              <v-chip size="small" color="blue" class="mt-2">
                {{ user.status || 'active' }}
              </v-chip>
            </div>

            <!-- Actions -->
            <v-card-actions class="justify-center mt-2">
              <v-btn size="small" @click="openEdit(user)">Edit</v-btn>
              <v-btn size="small" color="error" @click="onDelete(user.id)">
                Delete
              </v-btn>
            </v-card-actions>

          </v-card>
        </v-col>
      </v-row>

      <!-- ❗ No Data -->
      <div v-if="filteredUsers.length === 0" class="text-center mt-6">
        No users found
      </div>

      <!-- 🔥 Pagination -->
      <div class="d-flex justify-center mt-6">
        <v-pagination v-model="page" :length="totalPages" />
      </div>

    </v-card>

    <!-- ➕ Dialog -->
    <v-dialog v-model="dialog" max-width="400">
      <v-card>
        <v-card-title>
          {{ isEdit ? "Edit User" : "Add User" }}
        </v-card-title>

        <v-card-text>
          <v-text-field v-model="form.name" label="Name" />
          <v-text-field v-model="form.email" label="Email" />
        </v-card-text>
        <v-select v-model="form.role" :items="['Admin', 'User']" label="Role" variant="outlined" class="mt-2" />

        <v-card-actions>
          <v-btn @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveUser">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="errorOpen" color="error" timeout="4000">
      {{ errorText }}
    </v-snackbar>

  </v-container>
</template>

<script setup lang="ts">
// โค้ดควบคุมหน้าจัดการผู้ใช้:
// - subscribe ข้อมูล collection "users" แบบ realtime ด้วย onSnapshot
// - filter และแบ่งหน้า (pagination) ในฝั่ง client
// - เพิ่ม/แก้ไข/ลบผู้ใช้ พร้อมจับ error แสดง snackbar
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore"
import { db } from "../../firebase/config"

interface User {
  id: string
  name: string
  email: string
  role: string
  status?: string
}

const users = ref<User[]>([])
const search = ref("")
const errorOpen = ref(false)
const errorText = ref("")
function showError(msg: string) {
  errorText.value = msg
  errorOpen.value = true
}

// pagination
const page = ref(1)
const itemsPerPage = 8

// dialog
const dialog = ref(false)
const isEdit = ref(false)
const editId = ref("")

const form = ref({
  name: "",
  email: "",
  role: "User"
})

const unsubscribe = ref<null | (() => void)>(null)
// โหลดข้อมูลผู้ใช้แบบ realtime; หากเกิด error (เช่น ไม่มีสิทธิ์) จะแจ้งผ่าน snackbar
onMounted(() => {
  unsubscribe.value = onSnapshot(
    collection(db, "users"),
    snapshot => {
      users.value = snapshot.docs.map(d => {
        const data = d.data() as any
        return {
          id: d.id,
          name: data.name ?? data.displayName ?? "",
          email: data.email ?? "",
          role: data.role ?? "User",
          status: data.status ?? "active"
        }
      })
    },
    err => {
      users.value = []
      showError(err?.message || "ไม่สามารถโหลดผู้ใช้งานได้ (อาจไม่มีสิทธิ์)")
    }
  )
})
onBeforeUnmount(() => {
  if (unsubscribe.value) unsubscribe.value()
})

// 🔍 filter
// กรองรายชื่อจากชื่อ/อีเมลที่พิมพ์ในช่องค้นหา
const filteredUsers = computed(() => {
  return users.value.filter(u =>
    u.name.toLowerCase().includes(search.value.toLowerCase()) ||
    u.email.toLowerCase().includes(search.value.toLowerCase())
  )
})

// 🔥 pagination logic
const totalPages = computed(() =>
  Math.ceil(filteredUsers.value.length / itemsPerPage)
)

const paginatedUsers = computed(() => {
  const start = (page.value - 1) * itemsPerPage
  return filteredUsers.value.slice(start, start + itemsPerPage)
})

// ➕ add
function openAdd() {
  isEdit.value = false
  form.value = { name: "", email: "", role: "User" }
  dialog.value = true
}

// ✏️ edit
function openEdit(user: User) {
  isEdit.value = true
  editId.value = user.id
  form.value = { name: user.name, email: user.email, role: user.role || "User" }
  dialog.value = true
}

// 💾 save
// หากเป็นโหมดแก้ไขจะ update ที่เอกสารเดิม มิฉะนั้นจะเพิ่มผู้ใช้ใหม่
async function saveUser() {
  if (!form.value.name || !form.value.email) return

  try {
    if (isEdit.value) {
      await updateDoc(doc(db, "users", editId.value), {
        name: form.value.name,
        email: form.value.email,
        role: form.value.role
      })
    } else {
      await addDoc(collection(db, "users"), {
        name: form.value.name,
        email: form.value.email,
        role: form.value.role,
        status: "active"
      })
    }
  } catch (e: any) {
    showError(e?.message || "บันทึกผู้ใช้ไม่สำเร็จ")
  }

  dialog.value = false
}

// ❌ delete
// ยืนยันก่อนลบ และจับ error เมื่อไม่มีสิทธิ์
async function onDelete(id: string) {
  if (!confirm("Delete user?")) return
  try {
    await deleteDoc(doc(db, "users", id))
  } catch (e: any) {
    showError(e?.message || "ลบผู้ใช้ไม่สำเร็จ")
  }
}
</script>

<style scoped>
@import "../css/usermanage.css";
</style>
