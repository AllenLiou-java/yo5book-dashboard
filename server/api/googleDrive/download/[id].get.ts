export default defineEventHandler(async (event) => {
    const fileId = getRouterParam(event, 'id')

    if (!fileId) {
        throw createError({ statusCode: 400, message: '遺失檔案 ID' })
    }

    try {
        const drive = getDriveClient()

        // 先取得檔案 Metadata，用於設定回傳的檔名與格式
        const meta = await drive.files.get({
            fileId: fileId,
            fields: 'name, mimeType',
            supportsAllDrives: true
        })

        // 取得檔案內容 Stream
        const response = await drive.files.get(
            { fileId: fileId, alt: 'media', supportsAllDrives: true },
            { responseType: 'stream' }
        )

        // 設定 Header 強制瀏覽器觸發下載行為
        const fileName = encodeURIComponent(meta.data.name || 'downloaded_file')
        setResponseHeader(event, 'Content-Disposition', `attachment; filename*=UTF-8''${fileName}`)
        setResponseHeader(event, 'Content-Type', meta.data.mimeType || 'application/octet-stream')

        // Nitro 內建 sendStream，直接將資料流回傳給前端
        return sendStream(event, response.data)
    } catch (error: unknown) {
        console.error('下載失敗:', error)
        throw createError({
            statusCode: 500,
            message: '檔案下載失敗或權限不足'
        })
    }
})
