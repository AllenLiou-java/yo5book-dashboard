export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { fileName, mimeType, folderId } = body

    // 👇 新增：動態擷取當前前端的網域 (例如 http://localhost:3000 或未來的正式網址)
    const clientOrigin = getRequestHeader(event, 'origin') || 'http://localhost:3000'

    try {
        // 1. 取得底層的 Access Token
        const authClient = await driveAuth.getClient()
        const { token } = await authClient.getAccessToken()

        // 2. 透過原生 Fetch 呼叫 Google Drive 的 Resumable Upload API
        const response = await fetch(
            'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    // 告知 Google 預計上傳的檔案格式
                    'X-Upload-Content-Type': mimeType || 'application/octet-stream',
                    // 👇 關鍵修改：強制帶入 Origin，讓 Google 產生的網址允許此網域跨域上傳
                    Origin: clientOrigin
                },
                // 設定檔案的 Metadata (名稱、目標資料夾、共用雲端硬碟支援)
                body: JSON.stringify({
                    name: fileName,
                    parents: [folderId]
                })
            }
        )

        // 3. Google 會將專屬的上傳網址放在 Header 的 'Location' 欄位
        const uploadUrl = response.headers.get('Location')

        if (!uploadUrl) {
            throw new Error('無法取得 Google Drive 續傳網址')
        }

        return { success: true, uploadUrl }
    } catch (error: unknown) {
        throw createError({
            statusCode: 500,
            message: `申請上傳網址失敗: ${error instanceof Error ? error.message : '未知錯誤'}`
        })
    }
})
