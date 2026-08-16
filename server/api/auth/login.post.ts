import { compare } from 'bcrypt-ts'
import jwt from 'jsonwebtoken'
import type { AdminInfo } from '~/types/userInfo'
import { H3Error } from 'h3'

export default defineEventHandler(async (event) => {
    try {
        // 1. 取得環境變數與請求內容
        const config = useRuntimeConfig(event)
        const jwtSecret = config.jwtSecret

        // 如果 JWT Secret 未設定，拋出伺服器錯誤，避免使用不安全的預設值
        if (!jwtSecret) {
            throw createError({
                statusCode: 500,
                message: '伺服器設定錯誤：未提供 JWT Secret'
            })
        }

        const body = await readBody(event)
        const { email, password } = body

        // 2. 驗證輸入
        if (!email || !password) {
            throw createError({ statusCode: 400, message: '請提供電子郵件和密碼' })
        }

        // 3. 查詢管理員
        const adminsRef = db.ref('admins')
        const snapshot = await adminsRef.orderByChild('email').equalTo(email).once('value')

        const snapshotVal = snapshot.val()
        const adminData = (
            snapshot.exists() ? Object.values(snapshotVal)[0] : null
        ) as AdminInfo | null

        // 4. 比對密碼 (即使找不到使用者，也執行比對以防範時序攻擊)
        const isMatch = await compare(password, adminData?.password || '')

        if (!adminData || !isMatch) {
            throw createError({ statusCode: 401, message: '帳號或密碼錯誤' })
        }

        // 5. 簽發 JWT Token (設定 6 小時過期)
        const token = jwt.sign({ id: adminData.id, email: adminData.email }, jwtSecret, {
            expiresIn: '6h'
        })

        // ★ JWT 放進 HttpOnly Cookie
        setCookie(event, 'admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 4, // 4 小時
            path: '/'
        })

        return {
            success: true,
            user: { id: adminData.id, email: adminData.email }
        }
    } catch (error) {
        // 如果是已知的 H3Error (例如我們自己 throw 的)，就直接再次拋出
        if (error instanceof H3Error) throw error
        // 對於未知的伺服器錯誤，回傳一個通用的 500 錯誤
        throw createError({ statusCode: 500, message: '伺服器內部錯誤' })
    }
})
