import type { ProductSimple } from '~/types/product'
import { ProductSimpleRepository } from '~~/server/repositories/ProductRepository'

export default defineEventHandler(async () => {
    try {
        // 直接取出所有訂單資料
        const data = await ProductSimpleRepository.findAll()

        // 將 Object 轉換為 Array，並注入 orderId
        const productSimpleList: ProductSimple[] = Object.entries(data).map(([id, product]) => ({
            productId: id,
            ...product
        }))

        // 依照 orderDate 排序 (由新到舊降冪排序)
        productSimpleList.sort()

        return {
            success: true,
            data: productSimpleList,
            message: '取得產品資訊(簡化)成功'
        }
    } catch (error: unknown) {
        throw createError({
            statusCode: 500,
            message: error instanceof Error ? error.message : 'Internal Server Error'
        })
    }
})
