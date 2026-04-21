import type { GroupBuyingData, GroupBuyingProduct } from '~/types/groupBuying'
import type { ApiResponse } from '~/types/api'

export default defineEventHandler(async (event): Promise<ApiResponse<GroupBuyingData>> => {
    try {
        const body = await readBody(event)

        if (!body) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Missing request body'
            })
        }

        const ref = db.ref('group_buying')
        // Firebase push() 會自動產生一個唯一的 key (gid)
        const newData: GroupBuyingData = {
            buildTime: Math.floor(Date.now() / 1000),
            unitName: body.unitName,
            isLaunched: body.isLaunched,
            title: body.title,
            bannerUrl: body.bannerUrl,
            endDate: body.endDate,
            description: body.description,
            products: body.products.map((product: GroupBuyingProduct) => ({
                ...product,
                isLaunched: true
            }))
        }

        const newRef = ref.push()
        await newRef.set(newData)

        newData.gid = newRef.key

        return {
            success: true,
            data: newData
        }
    } catch (error: unknown) {
        throw createError({
            statusCode: 500,
            statusMessage: error instanceof Error ? error.message : 'Internal Server Error'
        })
    }
})
