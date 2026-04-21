import type { ApiResponse } from '~/types/api'

export default defineEventHandler(async (event): Promise<ApiResponse<string>> => {
    const groupId = getRouterParam(event, 'groupId')
    if (!groupId || typeof groupId !== 'string') {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid groupId'
        })
    }

    const body = await readBody(event)
    if (!body || typeof body !== 'object') {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid body'
        })
    }

    try {
        // 1. Test Write: Create a test entry
        const ref = db.ref(`group_buying/${groupId}`)

        // 使用 once('value') 取得資料快照
        await ref.update(body)

        return {
            success: true,
            data: '更新成功'
        }
    } catch (error: unknown) {
        throw createError({
            statusCode: 500,
            statusMessage: error instanceof Error ? error.message : 'Internal Server Error'
        })
    }
})
