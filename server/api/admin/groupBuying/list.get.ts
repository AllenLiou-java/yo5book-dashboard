import type { GroupBuyingData } from '~/types/groupBuying'
import type { ApiResponse } from '~/types/api'

export default defineEventHandler(async (): Promise<ApiResponse<GroupBuyingData[]>> => {
    // 目前無根據頁數(指定每頁筆數)取對應資料的功能，而是一次取全部，未來資料量一多會影響效能，未來待優化
    // 目前僅針對buildTime進行排序

    try {
        const snapshot = await db.ref('group_buying').orderByKey().get()

        const snapshotVal = snapshot.val()

        const data = Object.entries(snapshotVal).map(([key, value]) => ({
            gid: key,
            ...(value as GroupBuyingData)
        }))

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
