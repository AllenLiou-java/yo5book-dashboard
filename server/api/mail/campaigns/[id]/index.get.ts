import type { ApiResponse } from '~/types/api'
import { EmailCampaignsRepository } from '~~/server/repositories/EmailCampaignsRepository'

export default defineEventHandler(async (event): Promise<ApiResponse<object>> => {
    const id = getRouterParam(event, 'id')
    if (!id || typeof id !== 'string') {
        throw createError({
            statusCode: 400,
            message: '無效的 groupId'
        })
    }

    try {
        const snapshotVal = await EmailCampaignsRepository.findById(id)

        const emailList = []
        for (const [emailKey, emailData] of Object.entries(snapshotVal)) {
            for (const [mailId, log] of Object.entries(emailData)) {
                emailList.push({
                    ...log,
                    emailKey,
                    mailId
                })
            }
        }

        return {
            success: true,
            data: emailList,
            message: '取得成功'
        }
    } catch (error: unknown) {
        throw createError({
            statusCode: 500,
            message: error instanceof Error ? error.message : 'Internal Server Error'
        })
    }
})
