import jwt from 'jsonwebtoken'
import type { H3Event } from 'h3'

interface AdminPayload {
    id: string
    email: string
}

// 從 cookie 驗證 JWT 並將 payload 注入 event.context
const authenticateRequest = (event: H3Event) => {
    const config = useRuntimeConfig(event)
    const token = getCookie(event, 'admin_token')

    if (!token) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized: 尚未登入'
        })
    }

    try {
        const payload = jwt.verify(token, config.jwtSecret) as AdminPayload

        // 將驗證後的 admin 資訊存入 event.context
        event.context.admin = payload
    } catch {
        // JWT 驗證失敗 (過期或無效)

        throw createError({
            statusCode: 401,
            message: 'Unauthorized: 登入已失效，請重新登入'
        })
    }
}

export default defineEventHandler((event) => {
    const path = event.path

    if (
        path &&
        (path.startsWith('/api/admin/') || path === '/api/auth/me' || path === '/api/auth/logout')
    ) {
        authenticateRequest(event)
    }
})
