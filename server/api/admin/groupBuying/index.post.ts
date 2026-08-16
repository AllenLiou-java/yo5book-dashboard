import type { GroupBuyingData, GroupBuyingProduct } from '~/types/groupBuying'
import type { ApiResponse } from '~/types/api'
import { GroupBuyingRepository } from '#server/repositories/GroupBuyingRepository'

export default defineEventHandler(async (event): Promise<ApiResponse<GroupBuyingData>> => {
    try {
        const body = await readBody(event)

        if (!body) {
            throw createError({
                statusCode: 400,
                message: 'Missing request body'
            })
        }

        const newData: GroupBuyingData = {
            buildTime: Date.now(),
            unitName: body.unitName,
            isLaunched: body.isLaunched,
            title: body.title,
            bannerUrl: body.bannerUrl,
            endDate: body.endDate,
            description: body.description,
            products: Object.fromEntries(
                body.products.map(({ productId, ...rest }: Partial<GroupBuyingProduct>) => [
                    productId,
                    {
                        ...rest,
                        isLaunched: true
                    }
                ])
            )
        }

        newData.gid = await GroupBuyingRepository.create(newData)
        newData.status = 'active'
        // 將 products格式還原回 array，以便前端顯示
        newData.products = Object.entries(newData.products).map(([productId, product]) => ({
            productId,
            ...product
        }))

        return {
            success: true,
            data: newData,
            message: '新增成功'
        }
    } catch (error: unknown) {
        throw createError({
            statusCode: 500,
            message: error instanceof Error ? error.message : 'Internal Server Error'
        })
    }
})
