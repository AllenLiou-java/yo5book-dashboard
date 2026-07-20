import nodemailer from 'nodemailer'

const config = useRuntimeConfig()

export const transporter = nodemailer.createTransport({
    pool: true, // 開啟連線池機制
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    maxConnections: 3, // 限制最大平行連線數 (避免被 Gmail 視為 DDoS 攻擊)
    maxMessages: 100, // 每個連線最多處理的信件數，超過會自動重新連線
    auth: { user: 'info@yooooobook.com', pass: config.gmailAppPassword }
})
