export default defineEventHandler(async () => {
    try {
        // 1. Test Write: Create a test entry
        const ref = db.ref('products_simple')

        // 使用 once('value') 取得資料快照
        const snapshot = await ref.once('value')
        const data = snapshot.val()

        if (!data) {
            return {
                success: true,
                data
            }
        }

        return {
            success: true,
            data
        }
    } catch (error: unknown) {
        throw createError({
            statusCode: 500,
            statusMessage: error instanceof Error ? error.message : 'Internal Server Error'
        })
    }
})
