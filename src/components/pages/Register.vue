<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card elevation="6">
          <v-card-title class="text-h5">Create account</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="onRegister">
              <v-text-field
                label="Full name"
                v-model="displayName"
                required
                prepend-inner-icon="mdi-account"
              />
              <v-text-field
                label="Email"
                v-model="email"
                type="email"
                required
                prepend-inner-icon="mdi-email"
              />
              <v-text-field
                label="Password"
                v-model="password"
                type="password"
                required
                prepend-inner-icon="mdi-lock"
              />

              <v-card-actions>
                <v-spacer />
                <v-btn color="primary" prepend-icon="mdi-account-plus" type="submit">Register</v-btn>
              </v-card-actions>
            </v-form>
          </v-card-text>
          <v-card-subtitle class="px-6 pb-6">
            <RouterLink to="/login">Already have an account? Login</RouterLink>
          </v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { registerUser } from '../../firebase/auth'

const router = useRouter()
const displayName = ref('')
const email = ref('')
const password = ref('')

const onRegister = async () => {
  try {
    const user = await registerUser(email.value, password.value, displayName.value)
    if (user) {
      router.push('/todos')
    }
  } catch (err: any) {
    alert(err.message || 'Registration failed')
  }
}
</script>

<style scoped>
.v-card { padding: 16px }
</style>
