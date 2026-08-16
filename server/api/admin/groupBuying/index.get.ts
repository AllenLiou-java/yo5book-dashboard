import type { GroupBuyingData } from '~/types/groupBuying'
import type { ApiResponse } from '~/types/api'
import { GroupBuyingRepository } from '#server/repositories/GroupBuyingRepository'

export default defineEventHandler(async (): Promise<ApiResponse<GroupBuyingData[]>> => {
    // 目前無根據頁數(指定每頁筆數)取對應資料的功能，而是一次取全部，未來資料量一多會影響效能，未來待優化
    // 目前僅針對buildTime進行排序

    try {
        const snapshotVal = await GroupBuyingRepository.findAll()

        // 1. 使用 Object.entries 前先確保 snapshotVal 有值
        const data: GroupBuyingData[] = Object.entries(snapshotVal || {})
            .map(([gid, groupBuyingItem]) => ({
                ...groupBuyingItem, // 2. 使用展開運算子保留所有屬性，免去逐一宣告
                gid,
                // 3. 確保 products 存在再進行轉換，避免 Firebase 查無資料時拋出例外錯誤
                products: groupBuyingItem.products
                    ? Object.entries(groupBuyingItem.products).map(([productId, product]) => ({
                          productId,
                          ...product
                      }))
                    : []
            }))
            .sort((a, b) => (b.buildTime || 0) - (a.buildTime || 0)) //依據 buildTime 欄位降冪排序

        return {
            success: true,
            data,
            message: '取得團購資料成功'
        }
    } catch (error: unknown) {
        throw createError({
            statusCode: 500,
            message: error instanceof Error ? error.message : 'Internal Server Error'
        })
    }
})
