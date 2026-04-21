<template>
    <div>
        <h1>Dashboard Page</h1>

        <button @click="authStore.logout">Logout</button>
    </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
</script>

<style scoped></style>
