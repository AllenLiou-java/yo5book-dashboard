<template>
    <UTooltip v-bind="$attrs" :arrow="arrow" :delay-duration="delayDuration">
        <slot />
        <template v-if="$slots.content" #content>
            <slot name="content" />
        </template>
    </UTooltip>
</template>

<script setup lang="ts">
defineOptions({
    inheritAttrs: false
})

withDefaults(
    defineProps<{
        arrow?: boolean
        delayDuration?: number
    }>(),
    {
        arrow: true,
        delayDuration: 0
    }
)
</script>
