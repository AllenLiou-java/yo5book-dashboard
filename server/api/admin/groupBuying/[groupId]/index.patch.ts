import type { ApiResponse } from '~/types/api'
import { GroupBuyingRepository } from '#server/repositories/GroupBuyingRepository'

export default defineEventHandler(async (event): Promise<ApiResponse<object>> => {
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
        await GroupBuyingRepository.update(groupId, body)

        return {
            success: true,
            data: {},
            message: '更新成功'
        }
    } catch (error: unknown) {
        throw createError({
            statusCode: 500,
            statusMessage: error instanceof Error ? error.message : 'Internal Server Error'
        })
    }
})
