export default defineNuxtRouteMiddleware(async (to) => {
    const authStore = useAuthStore()

    // SSR：
    // 每次初次載入頁面時，都需要透過 Cookie 恢復登入狀態
    //
    // Client：
    // Pinia 已經有 admin 時，不需要再次驗證
    if (import.meta.server || !authStore.isLoggedIn) {
        const isAuthenticated = await authStore.fetchAdmin()

        if (!isAuthenticated && to.path !== '/login') {
            return navigateTo('/login')
        }
    }

    // 已登入者不可進入登入頁
    if (authStore.isLoggedIn && to.path === '/login') {
        return navigateTo('/admin')
    }
})
