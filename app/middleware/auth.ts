export default defineNuxtRouteMiddleware(async (to) => {
    const authStore = useAuthStore()

    // 1. 登入頁
    if (to.path === '/login') {
        // 已登入 → 不允許進入登入頁
        if (authStore.isLoggedIn) {
            return navigateTo('/admin')
        }

        // 未登入 → 直接顯示登入頁
        return
    }

    // SSR：
    // 每次初次載入頁面時，都需要透過 Cookie 恢復登入狀態
    //
    // Client：
    // Pinia 已經有 admin 時，不需要再次驗證
    if (import.meta.server || !authStore.isLoggedIn) {
        const isAuthenticated = await authStore.fetchAdmin()

        if (!isAuthenticated) {
            return navigateTo('/login')
        }
    }
})
