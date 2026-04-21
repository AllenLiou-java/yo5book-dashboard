import type { ApiResponse } from '~/types/api'

export default defineEventHandler(async (event): Promise<ApiResponse<string>> => {
    try {
        const body = await readBody(event)

        if (!body) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Missing request body'
            })
        }

        await db.ref(`group_buying/${body.groupId}`).remove()

        return {
            success: true,
            data: '刪除成功'
        }
    } catch (error: unknown) {
        throw createError({
            statusCode: 500,
            statusMessage: error instanceof Error ? error.message : 'Internal Server Error'
        })
    }
})
