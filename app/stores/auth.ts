import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useCookie } from '#app'

export const useAuthStore = defineStore('auth', () => {
    const token = useCookie<string | null>('admin_token', {
        default: () => null,
        maxAge: 60 * 60,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    })

    const admin = useCookie<{ id: string | undefined; email: string } | null>('admin_user', {
        default: () => null,
        maxAge: 60 * 60,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    })

    const isLoggedIn = computed(() => !!token.value && !!admin.value)

    function setAdmin(adminData: { id: string | undefined; email: string }, jwtToken: string) {
        admin.value = adminData
        token.value = jwtToken
    }

    function logout() {
        admin.value = null
        // 將 cookie 的 value 設為 null，Nuxt 會自動清除該 Cookie
        token.value = null
        // 可以在這裡處理路由跳轉
        navigateTo('/login')
    }

    // 必須將需要讓外部使用的狀態與方法 return 出去
    return {
        token,
        admin,
        isLoggedIn,
        setAdmin,
        logout
    }
})
