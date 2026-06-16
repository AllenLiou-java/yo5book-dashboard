export default defineEventHandler(async (event) => {
    const fileId = getRouterParam(event, 'id')

    if (!fileId) {
        throw createError({ statusCode: 400, message: '遺失檔案 ID' })
    }

    try {
        const drive = getDriveClient()

        // 使用 update 進行軟刪除 (移至垃圾桶)
        await drive.files.update({
            fileId: fileId,
            requestBody: {
                trashed: true // 核心關鍵：設為 true 代表丟入垃圾桶
            },
            // 先前踩過的坑：共用雲端硬碟一定要加這行
            supportsAllDrives: true
        })

        return {
            success: true,
            message: '檔案已移至垃圾桶'
        }
    } catch (error: unknown) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 404) {
            throw createError({ statusCode: 404, message: '找不到檔案，可能已經被刪除' })
        }

        throw createError({
            statusCode: 500,
            message: `刪除操作失敗: ${error instanceof Error ? error.message : '未知錯誤'}`
        })
    }
})
