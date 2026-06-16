export default defineEventHandler(async (event) => {
    const { fileId } = await readBody(event)
    const drive = getDriveClient()

    try {
        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone'
            },
            supportsAllDrives: true
        })

        // 取得檔案的對外連結
        const fileMeta = await drive.files.get({
            fileId: fileId,
            fields: 'webViewLink, webContentLink',
            supportsAllDrives: true
        })

        return {
            success: true,
            webViewLink: fileMeta.data.webViewLink,
            webContentLink: fileMeta.data.webContentLink
        }
    } catch (error: unknown) {
        throw createError({
            statusCode: 500,
            message: `權限設定失敗: ${error instanceof Error ? error.message : '未知錯誤'}`
        })
    }
})
