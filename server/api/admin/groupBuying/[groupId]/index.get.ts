import type { GroupBuyingData } from '~/types/groupBuying'
import type { ApiResponse } from '~/types/api'
import { GroupBuyingRepository } from '#server/repositories/GroupBuyingRepository'

export default defineEventHandler(async (event): Promise<ApiResponse<GroupBuyingData>> => {
    const groupId = getRouterParam(event, 'groupId')
    if (!groupId) {
        throw createError({
            statusCode: 400,
            message: '缺少團購 ID'
        })
    }

    try {
        // 取得指定 groupId 的資料快照
        const snapshotVal = await GroupBuyingRepository.findByGroupId(groupId)

        const data = {
            ...snapshotVal,
            gid: groupId,
            products: Object.entries(snapshotVal.products).map(([productId, product]) => ({
                productId,
                ...product
            }))
        } as GroupBuyingData

        return {
            success: true,
            data,
            message: '取得團購資料成功'
        }
    } catch (error: unknown) {
        throw createError({
            statusCode: 500,
            statusMessage: error instanceof Error ? error.message : 'Internal Server Error'
        })
    }
})
