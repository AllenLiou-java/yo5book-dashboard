import type { ApiResponse } from '~/types/api'
import { EmailCampaignsRepository } from '~~/server/repositories/EmailCampaignsRepository'

export default defineEventHandler(async (event): Promise<ApiResponse<null>> => {
    const id = getRouterParam(event, 'id')
    const query = getQuery(event)
    const emailKey = query.emailKey as string
    const mailId = query.mailId as string

    if (!id || typeof id !== 'string') {
        throw createError({
            statusCode: 400,
            message: '無效的活動 ID'
        })
    }

    if (!emailKey || !mailId) {
        throw createError({
            statusCode: 400,
            message: '缺少必要參數 emailKey 或 mailId'
        })
    }

    try {
        await EmailCampaignsRepository.deleteLog(id, emailKey, mailId)

        return {
            success: true,
            data: null,
            message: '刪除成功'
        }
    } catch (error: unknown) {
        throw createError({
            statusCode: 500,
            message: error instanceof Error ? error.message : 'Internal Server Error'
        })
    }
})
