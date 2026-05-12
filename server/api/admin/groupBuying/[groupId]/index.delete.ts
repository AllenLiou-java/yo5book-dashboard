import type { ApiResponse } from '~/types/api'
import { GroupBuyingRepository } from '#server/repositories/GroupBuyingRepository'

export default defineEventHandler(async (event): Promise<ApiResponse<object>> => {
    const groupId = getRouterParam(event, 'groupId')
    if (!groupId || typeof groupId !== 'string') {
        throw createError({
            statusCode: 400,
            statusMessage: '無效的 groupId'
        })
    }

    try {
        await GroupBuyingRepository.delete(groupId)

        return {
            success: true,
            data: {},
            message: '刪除成功'
        }
    } catch (error: unknown) {
        throw createError({
            statusCode: 500,
            statusMessage: error instanceof Error ? error.message : 'Internal Server Error'
        })
    }
})
