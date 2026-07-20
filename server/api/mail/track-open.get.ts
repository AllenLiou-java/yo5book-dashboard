import { defineEventHandler, getQuery, setHeader } from 'h3'
import admin from 'firebase-admin'

const db = admin.database()

// 2. 1x1 透明 GIF 的 Base64 編碼
const transparentGif = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
)

export default defineEventHandler(async (event) => {
    // 取得網址列上的追蹤 ID (例如: /api/track-open?id=批次號碼_信箱)
    const query = getQuery(event)
    const trackId = query.id as string

    if (trackId) {
        try {
            // 3. 更新 Firebase 狀態 (將 opened 設為 true，並記錄開啟時間)
            const ref = db.ref(`emailCampaigns/${trackId}`)
            await ref.update({
                opened: true,
                openedAt: dbServerValue.TIMESTAMP
            })
        } catch (error) {
            console.error('更新開信狀態失敗:', error)
            // 就算資料庫掛了，也不要中斷，繼續往下給圖片
        }
    }

    setHeader(event, 'Content-Length', transparentGif.length)
    // 4. 設定正確的 HTTP Header，告訴信箱這是一張圖片，且「禁止快取」
    setHeader(event, 'Content-Type', 'image/gif')
    setHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    setHeader(event, 'Pragma', 'no-cache')
    setHeader(event, 'Expires', '0')

    // 5. 回傳透明圖片
    return transparentGif
})
