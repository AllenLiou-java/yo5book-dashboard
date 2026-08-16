import type { ProductSimple } from '~/types/product'
import type { ApiResponse } from '~/types/api'
import { ProductSimpleRepository } from '~~/server/repositories/ProductRepository'

export default defineEventHandler(async (event): Promise<ApiResponse<string>> => {
    try {
        const body = await readBody(event)

        if (!body) {
            throw createError({
                statusCode: 400,
                message: 'Missing request body'
            })
        }
        // 待調整------------------------------------
        // 準備要存入資料庫的產品資料
        const newProduct: ProductSimple = {
            productId: body.productId,
            name: body.name,
            imgSrc: body.imgSrc,
            launched: body.launched ?? false,
            isNew: body.isNew ?? false,
            isOnSale: body.isOnSale ?? false,
            price: {
                originalPrice: body.price?.originalPrice || 0,
                discount: body.price?.discount || 0
            }
        }

        // 呼叫 Repository 進行新增，並取得回傳的 productId (Firebase Key)
        const productId = await ProductSimpleRepository.create(newProduct)

        return {
            success: true,
            data: productId,
            message: '產品新增成功'
        }
    } catch (error: unknown) {
        throw createError({
            statusCode: 500,
            message: error instanceof Error ? error.message : 'Internal Server Error'
        })
    }
})
