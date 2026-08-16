<template>
    <div class="dark:bg-background-dark/50 min-h-screen bg-slate-50 p-8">
        <NuxtPage></NuxtPage>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: 'auth'
})
</script>

<style scoped></style>
