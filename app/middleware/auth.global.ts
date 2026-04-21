export default defineNuxtRouteMiddleware((to) => {
    const authStore = useAuthStore()

    // 如果使用者未登入，且目標路由是後台頁面，強制導向登入頁
    if (to.path.startsWith('/admin') && !authStore.isLoggedIn) {
        return navigateTo('/login')
    }

    // 如果使用者已登入，卻想進入登入頁，直接導向後台首頁
    if (to.path === '/login' && authStore.isLoggedIn) {
        return navigateTo('/admin')
    }

    // 3. 處理根路徑 / 自動導向
    if (to.path === '/') {
        return navigateTo(authStore.token ? '/admin' : '/login')
    }
})
