import { hash } from 'bcrypt-ts'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { email, password } = body

    const adminsRef = db.ref('admins')

    // 檢查 Email 是否已被註冊
    const snapshot = await adminsRef.orderByChild('email').equalTo(email).once('value')
    if (snapshot.exists()) {
        throw createError({ statusCode: 400, statusMessage: '此信箱已註冊為管理員' })
    }

    // 使用 bcrypt-ts 加密密碼 (Salt rounds 設為 10)
    const hashedPassword = await hash(password, 10)

    // 寫入 Realtime Database
    const newAdminRef = adminsRef.push()
    await newAdminRef.set({
        id: newAdminRef.key,
        email,
        password: hashedPassword,
        createdAt: Date.now(),
        status: 'active'
    })

    return { success: true, message: '註冊成功' }
})
