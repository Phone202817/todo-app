<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card elevation="6">
          <v-card-title class="text-h5">Login</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="login">
              <v-text-field
                label="Username"
                v-model="username"
                required
                prepend-inner-icon="mdi-account"
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
                <v-btn
                  color="primary"
                  prepend-icon="mdi-account-plus"
                  @click="register"
                >
                  Register
                </v-btn>
                <v-btn
                  color="primary"
                  prepend-icon="mdi-login"
                  type="submit"
                >
                  Login
                </v-btn>
              </v-card-actions>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();
const username = ref("");
const password = ref("");
const login = () => {
  if (username.value === "admin" && password.value === "password") {
    router.push("/todos");
  } else {
    // use Vuetify-friendly alert fallback
    // keep simple for now
    alert("Invalid credentials");
  }
};
const register = () => {
  router.push('/register')
};
</script>

<style scoped>
@import "../css/login.css";
</style>
