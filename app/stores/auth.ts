import { defineStore } from 'pinia'
import { useOrderStore } from '~/stores/order'
import { useGroupBuyingStore } from '~/stores/groupBuying'

interface Admin {
    id: string | undefined
    email: string
}

// Define the response type for /api/auth/me and /api/auth/login
interface AuthResponse {
    success: boolean
    user?: Admin // user might not be present if success is false
}

export const useAuthStore = defineStore('auth', () => {
    const admin = ref<Admin | null>(null)

    const isLoggedIn = computed(() => !!admin.value)

    function setAdmin(adminData: Admin) {
        admin.value = adminData
    }

    async function fetchAdmin() {
        try {
            // SSR 時會自動將目前 request 的 Cookie / headers
            // 傳遞給內部 API
            const requestFetch = useRequestFetch()

            const response = await requestFetch<AuthResponse>('/api/auth/me')

            if (response.success && response.user) {
                admin.value = response.user
                return true
            }

            admin.value = null
            return false
        } catch {
            admin.value = null
            return false
        }
    }

    /**
     * 處理管理員登入邏輯
     * @param credentials - 包含 email 和 password 的物件
     */
    async function login(credentials: { email: string; password: string }) {
        // API 請求和錯誤處理被封裝在 store action 中
        const response = await $fetch<AuthResponse>('/api/auth/login', {
            method: 'POST',
            body: credentials
        })

        if (response.success && response.user) {
            setAdmin(response.user)
        } else {
            // 如果 API 回應 success: false 但沒有拋出錯誤，我們自己拋出一個
            throw new Error('登入失敗')
        }
    }

    async function logout() {
        const orderStore = useOrderStore()
        const groupBuyingStore = useGroupBuyingStore()

        try {
            await $fetch('/api/auth/logout', {
                method: 'POST'
            })
        } finally {
            admin.value = null

            orderStore.reset()
            groupBuyingStore.reset()

            await navigateTo('/login')
        }
    }

    return {
        admin,
        isLoggedIn,
        setAdmin,
        fetchAdmin,
        login,
        logout
    }
})
