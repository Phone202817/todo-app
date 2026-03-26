<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card elevation="6">
          <v-card-title class="text-h5">Login</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="login">
              <v-text-field
                label="Email"
                v-model="email"
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
                <v-btn text @click="forgotPassword">Forgot?</v-btn>
                <v-btn color="primary" prepend-icon="mdi-account-plus" @click="register">Register</v-btn>
                <v-btn color="primary" prepend-icon="mdi-login" type="submit">Login</v-btn>
              </v-card-actions>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginUser } from '../../firebase/auth'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../../firebase/config'

const router = useRouter()
const email = ref('')
const password = ref('')

const login = async () => {
  try {
    await loginUser(email.value, password.value)
    router.push('/overview')
  } catch (err: any) {
    if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
      alert('Invalid credentials — please check email and password')
    } else {
      alert(err.message || 'Login failed')
    }
  }
}

const register = () => router.push('/register')

const forgotPassword = async () => {
  if (!email.value) {
    alert('Please enter your email to reset password')
    return
  }
  try {
    await sendPasswordResetEmail(auth, email.value)
    alert('Password reset email sent')
  } catch (err: any) {
    alert(err.message || 'Failed to send reset email')
  }
}
</script>

<style scoped>
@import "../css/login.css";
</style>
