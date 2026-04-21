<template>
    <div
        class="bg-surface text-on-surface flex min-h-screen items-center justify-center p-6 sm:p-12"
    >
        <div class="fixed inset-0 z-0 overflow-hidden">
            <div class="absolute inset-0 bg-[#eef2f8]"></div>
        </div>

        <main
            class="bg-surface-container-lowest relative z-10 grid min-h-175 w-full max-w-300 grid-cols-1 overflow-hidden rounded shadow-2xl lg:grid-cols-2"
        >
            <div class="group relative hidden overflow-hidden lg:block">
                <NuxtImg
                    alt="Modern Architectural Glass"
                    class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    src="/images/city.jpg"
                    provider="ipx"
                    format="webp"
                    quality="80"
                    loading="lazy"
                    placeholder
                />
                <div
                    class="brand-gradient-overlay absolute inset-0 flex flex-col justify-between p-16 text-white"
                >
                    <div class="space-y-12">
                        <div class="flex items-center gap-4">
                            <div
                                class="flex h-12 w-12 items-center justify-center rounded border border-white/20 bg-white/10 backdrop-blur-md"
                            >
                                <NuxtImg
                                    alt="yooooobook logo"
                                    class="inset-0 object-cover"
                                    src="/images/logo.png"
                                    format="webp"
                                    quality="50"
                                    loading="lazy"
                                    placeholder
                                    width="40"
                                    height="40"
                                />
                            </div>
                            <span class="text-2xl font-bold tracking-tight">Yooooobook</span>
                        </div>
                        <div class="space-y-6">
                            <h1 class="text-5xl leading-tight font-bold tracking-tight">
                                有良冊股份有限公司<br />
                                <span class="text-primary-fixed-dim">後端管理系統</span>
                            </h1>
                            <div class="bg-primary-fixed-dim h-1 w-20 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-surface-container-lowest flex flex-col justify-center p-8 sm:p-20">
                <div class="mx-auto w-full max-w-md">
                    <div class="mb-12">
                        <h2 class="text-on-surface mb-3 text-3xl font-bold tracking-tight">
                            登入帳號
                        </h2>
                    </div>

                    <form class="space-y-8 pl-8" @submit.prevent="onLogin">
                        <UFormField :error="errors.email" name="email" class="w-full">
                            <template #label>
                                <span
                                    class="text-outline text-xs font-bold tracking-widest uppercase"
                                    >Email帳號</span
                                >
                            </template>
                            <UInput
                                id="email"
                                v-model="email"
                                class="group w-full"
                                size="xl"
                                placeholder="輸入管理員帳號"
                            >
                                <template #leading>
                                    <span
                                        class="material-symbols-outlined text-outline group-focus-within:text-primary-container text-xl transition-colors"
                                        :class="{ 'text-error!': errors.email }"
                                        >person</span
                                    >
                                </template>
                            </UInput>
                        </UFormField>

                        <UFormField :error="errors.password" name="password" class="w-full">
                            <template #label>
                                <span
                                    class="text-outline text-xs font-bold tracking-widest uppercase"
                                    >密碼</span
                                >
                            </template>
                            <template #hint>
                                <a
                                    class="text-primary-container text-xs font-semibold hover:underline"
                                    href="#"
                                    >忘記密碼？</a
                                >
                            </template>
                            <UInput
                                id="password"
                                v-model="password"
                                :type="show ? 'text' : 'password'"
                                class="group w-full"
                                size="xl"
                                placeholder="輸入安全性密碼"
                            >
                                <template #leading>
                                    <span
                                        class="material-symbols-outlined text-outline group-focus-within:text-primary-container text-xl transition-colors"
                                        :class="{ 'text-error!': errors.password }"
                                        >lock</span
                                    >
                                </template>
                                <template #trailing>
                                    <UButton
                                        color="neutral"
                                        variant="link"
                                        size="sm"
                                        :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                                        :aria-label="show ? 'Hide password' : 'Show password'"
                                        :aria-pressed="show"
                                        aria-controls="password"
                                        @click="show = !show"
                                    />
                                </template>
                            </UInput>
                        </UFormField>

                        <UCheckbox
                            id="remember-me"
                            v-model="rememberMe"
                            name="rememberMe"
                            label="記住我"
                            :ui="{ label: 'text-on-surface-variant text-sm font-medium' }"
                        />

                        <p class="text-error text-xs font-medium">{{ errorMessage }}</p>

                        <UButton
                            type="submit"
                            :disabled="isSubmitting"
                            :loading="isSubmitting"
                            block
                            size="xl"
                            class="bg-primary shadow-primary/20 hover:bg-primary-container flex w-full items-center justify-center gap-3 rounded px-6 py-4 text-sm font-bold tracking-widest text-white uppercase shadow-xl transition-all duration-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            <span v-if="!isSubmitting">登入</span>
                            <template #trailing>
                                <span v-if="!isSubmitting" class="material-symbols-outlined text-lg"
                                    >arrow_forward</span
                                >
                            </template>
                        </UButton>
                    </form>

                    <div class="border-outline-variant/10 mt-16 border-t pt-8 text-center">
                        <p class="text-outline text-[0.7rem] leading-relaxed font-medium">
                            Copyright © 2026 Yooooobook.<br />
                            All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
const authStore = useAuthStore()
const show = ref(false)

const errorMessage = ref('')

// 1. 定義驗證架構 (Zod)
const validationSchema = toTypedSchema(
    zod.object({
        email: zod.string().min(1, '請輸入電子郵件').email('請輸入有效的電子郵件格式'),
        password: zod.string().min(1, '請輸入安全性密碼').min(6, '密碼至少需要 6 位元'),
        rememberMe: zod.boolean().optional()
    })
)

// 2. 初始化表單
const { handleSubmit, errors, isSubmitting } = useForm({
    validationSchema,
    initialValues: {
        email: 'ai0911953419@gmail.com',
        password: '12345678',
        rememberMe: false
    }
})

// 3. 定義欄位
const { value: email } = useField<string>('email')
const { value: password } = useField<string>('password')
const { value: rememberMe } = useField<boolean>('rememberMe')

// 4. 提交處理
const onLogin = handleSubmit(async (values) => {
    try {
        const response = await $fetch('/api/auth/login', {
            method: 'POST',
            body: {
                email: values.email,
                password: values.password
            }
        })

        if (response.success) {
            authStore.setAdmin(response.user, response.token)
            await navigateTo('/admin')
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        errorMessage.value = error.data?.message || '登入失敗，請稍後再試'
    }
})
</script>

<style scoped>
.material-symbols-outlined {
    font-variation-settings:
        'FILL' 0,
        'wght' 400,
        'GRAD' 0,
        'opsz' 24;
}

.brand-gradient-overlay {
    background: linear-gradient(135deg, rgba(8, 44, 75, 0.95) 0%, rgba(0, 23, 45, 0.85) 100%);
}
</style>
