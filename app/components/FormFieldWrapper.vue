<template>
    <div class="relative">
        <slot />

        <!-- 檢視模式遮罩 -->
        <div v-if="readonly" class="absolute inset-0 z-10" />
    </div>
</template>

<script setup lang="ts">
defineProps<{
    readonly?: boolean
}>()
</script>
