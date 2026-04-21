import { compare } from 'bcrypt-ts'
import jwt from 'jsonwebtoken'
import type { AdminInfo } from '~/types/userInfo'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { email, password } = body

    const adminsRef = db.ref('admins')
    const snapshot = await adminsRef.orderByChild('email').equalTo(email).once('value')

    if (!snapshot.exists()) {
        throw createError({ statusCode: 401, message: '帳號或密碼錯誤' })
    }

    // 取得該管理員的資料 (因為 orderByChild 回傳的是一個物件集合)
    const adminData = Object.values(snapshot.val())[0] as AdminInfo

    // 比對密碼
    const isMatch = await compare(password, adminData.password)
    if (!isMatch) {
        throw createError({ statusCode: 401, message: '帳號或密碼錯誤' })
    }

    // 1. 取得環境變數中的 JWT Secret
    const config = useRuntimeConfig()
    const jwtSecret = config.jwtSecret || process.env.JWT_SECRET || 'default_secret'

    // 2. 簽發 JWT Token (這裡設定 1 天過期)
    const token = jwt.sign({ id: adminData.id, email: adminData.email }, jwtSecret, {
        expiresIn: '1h'
    })

    return {
        success: true,
        token, // 回傳 JWT
        user: { id: adminData.id, email: adminData.email }
    }
})
