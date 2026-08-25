// server/api/campaign-keys.get.ts
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)

    // Firebase 資料庫基本網址與憑證（建議放 .env）
    const dbUrl = config.firebaseApiUrl // 例如: https://<PROJECT-ID>-default-rtdb.firebaseio.com
    const dbSecret = config.firebaseDbSecret // Realtime Database 密鑰或 Auth Token（如有設安全規則）

    const targetPath = 'emailCampaigns' // 你放置資料的根節點路徑
    const requestUrl = `${dbUrl}/${targetPath}.json?shallow=true${dbSecret ? `&auth=${dbSecret}` : ''}`

    try {
        // shallow=true 回傳格式為: { "GB20260819-CPB-Assn": true, "NB20260819-CPA-Firm": true, ... }
        const data = await $fetch<Record<string, boolean>>(requestUrl)

        if (!data) {
            return { keys: [] }
        }

        // 只提取第一層的 key
        const keys = Object.keys(data)

        return {
            success: true,
            keys
        }
    } catch (error: unknown) {
        throw createError({
            statusCode: 500,
            message: error instanceof Error ? error.message : 'Internal Server Error'
        })
    }
})
