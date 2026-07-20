/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { readMultipartFormData, createError } from 'h3'

const config = useRuntimeConfig()

const baseUrl = config.webUrl || 'http://localhost:3000'

const subjectList = [
    '【新書上市】公司登記實務新作2冊｜閉鎖性公司 × 特殊案例一次掌握',
    '【新書上市】一次掌握閉鎖性股份有限公司與特殊登記實務',
    '【新書上市】進階公司登記實務工具書｜兩本新作同步出版',
    '【新書上市】公司登記實務系列最新力作｜閉鎖性公司 × 特殊案例',
    '【新書上市】從閉鎖性公司到特殊案例｜打造完整登記實務能力',
    '【新書上市】《閉鎖性股份有限公司》與《公司登記特殊案例實務解析》正式推出',
    '【新書上市】最新實務工具書｜深入解析閉鎖性公司與特殊案例',
    '【新書上市】閉鎖性股份有限公司與特殊登記案例完整解析',
    '【新書上市】閉鎖性股份有限公司與特殊登記案件全方位解析',
    '【新書上市】公司登記特殊案件全攻略｜閉鎖性公司 × 特殊案例解析'
]

export default defineEventHandler(async (event) => {
    // 測量：API 接收到資料與解析的耗時
    // console.time('Phase-1-資料解析')
    const formData = await readMultipartFormData(event)
    if (!formData) throw createError({ statusCode: 400, statusMessage: '沒有收到資料' })

    let htmlContent = ''
    let recipients: { email: string; name?: string }[] = []
    let campaignType = ''
    let idType = ''
    let orgType = ''

    for (const field of formData) {
        if (field.name === 'html') {
            htmlContent = field.data.toString('utf-8')
        } else if (field.name === 'recipients') {
            try {
                recipients = JSON.parse(field.data.toString('utf-8'))
            } catch (e) {
                throw createError({ statusCode: 400, statusMessage: '名單解析失敗' })
            }
        } else if (field.name === 'campaignType') {
            campaignType = field.data.toString('utf-8')
        } else if (field.name === 'idType') {
            idType = field.data.toString('utf-8')
        } else if (field.name === 'orgType') {
            orgType = field.data.toString('utf-8')
        }
    }
    // console.timeEnd('Phase-1-資料解析')

    let successCount = 0
    let failedCount = 0
    const errors = []

    // 測量：SMTP 連線池喚醒耗時 (通常只有第一次會比較久)
    // console.time('Phase-2-SMTP伺服器驗證')
    try {
        // verify() 會測試連線是否正常，使用連線池時，這能確保通道已打通
        await transporter.verify()
    } catch (err) {
        // console.error('SMTP 連線失敗:', err)
        throw createError({ statusCode: 500, statusMessage: '無法連線至郵件伺服器' })
    }
    // console.timeEnd('Phase-2-SMTP伺服器驗證')

    // console.log(`\n--- 開始處理本批次: ${recipients.length} 封信 ---`)

    // 產生 campaignId
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const campaignId = `${campaignType}${year}${month}${day}-${idType}-${orgType}`

    for (const recipient of recipients) {
        if (!recipient.email) continue

        // 1. 產生這封信專屬的 Track ID (我們將 Email 裡的 @ 和 . 替換掉當作 Key)
        const safeEmailKey = recipient.email.replace(/[.#$[\]]/g, '_')
        const trackId = `${campaignId}/${safeEmailKey}`

        // 2. 建立追蹤像素圖片標籤
        const trackingPixelUrl = `${baseUrl}/api/mail/track-open?id=${trackId}`
        const trackingPixelHtml = `<img src="${trackingPixelUrl}" width="1" height="1" style="display:none; border:0;" alt="" />`

        // 將追蹤圖片加入 HTML 底部
        let customizedHtml = htmlContent.replace(/{{mail}}/g, recipient.email || '')
        customizedHtml = `${customizedHtml}${trackingPixelHtml}`

        const randomSubject = subjectList[Math.floor(Math.random() * subjectList.length)]

        // 3. 在寄出前，先將初始狀態寫入 Firebase Realtime Database
        try {
            // await db.ref(`emailCampaigns/${trackId}`).set({
            //     email: recipient.email,
            //     name: recipient.name || '未知',
            //     sentAt: dbServerValue.TIMESTAMP,
            //     opened: false, // 預設未開信
            //     openedAt: null
            // })

            await db.ref(`emailCampaigns/${trackId}`).push({
                subject: randomSubject,
                email: recipient.email,
                name: recipient.name || '未知',
                sentAt: dbServerValue.TIMESTAMP,
                opened: false, // 預設未開信
                openedAt: null
            })
        } catch (dbErr) {
            console.error('寫入 Firebase 失敗', dbErr)
        }

        // 【關鍵優化 2】：針對「單封信件」的發送進行測量
        // const timerLabel = `[Send] ${recipient.email}`
        // console.time(timerLabel)

        try {
            await transporter.sendMail({
                from: '"有良冊股份有限公司" <info@yooooobook.com>',
                to: recipient.email,
                subject: randomSubject,
                html: customizedHtml
            })

            // console.timeEnd(timerLabel) // 印出單封信耗時
            successCount++

            // 隨機擬人化延遲 (2000 ~ 4000 毫秒)
            const jitterDelay = Math.floor(Math.random() * 2000) + 2000
            // console.log(`> 成功，等待 ${jitterDelay} 毫秒...\n`)
            await new Promise((resolve) => setTimeout(resolve, jitterDelay))
        } catch (err: any) {
            // console.timeEnd(timerLabel) // 即使失敗也要印出耗時
            // console.error(`> 失敗: ${recipient.email} - ${err.message}\n`)
            failedCount++
            errors.push({ email: recipient.email, error: err.message })
            // 若寄信失敗，可以去 Firebase 把狀態改回 'failed'
            await db
                .ref(`emailCampaigns/${trackId}`)
                .update({ status: 'failed', error: err.message })
        }
    }

    // console.log(`--- 本批次結束 | 成功: ${successCount}, 失敗: ${failedCount} ---\n`)

    return { successCount, failedCount, errors }
})
