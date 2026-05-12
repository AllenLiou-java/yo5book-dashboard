<script setup lang="ts">
defineProps<{
    title: string
    description?: string
    submitLabel: string
    cancelLabel: string
    bodyContent?: string
    icon?: string
}>()

const emit = defineEmits<{ close: [boolean] }>()
</script>

<template>
    <UModal
        :close="{ onClick: () => emit('close', false) }"
        :title="title"
        :icon="icon"
        :description="description"
        :ui="{ footer: 'justify-end' }"
    >
        <template v-if="bodyContent" #body>
            <p>{{ bodyContent }}</p>
        </template>
        <template #footer>
            <div class="flex gap-2">
                <UButton
                    size="lg"
                    color="primary"
                    variant="outline"
                    :label="cancelLabel"
                    @click="emit('close', false)"
                />
                <UButton
                    size="lg"
                    color="primary"
                    :label="submitLabel"
                    @click="emit('close', true)"
                />
            </div>
        </template>
    </UModal>
</template>
