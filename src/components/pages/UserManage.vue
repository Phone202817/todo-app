<template>
    <v-card class="tabmenu pa-4">
        <v-card-title class="text-h5">User Management</v-card-title>
        <v-text-field v-model="search" label="Search" prepend-inner-icon="mdi-magnify" variant="outlined" hide-details
            single-line></v-text-field>
        <v-btn prepend-icon="mdi-account-plus" color="primary">Add User</v-btn>
    </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const search = ref('')
</script>

<style scoped>
@import "../css/usermanage.css";
</style>