import type { OrderData } from '~/types/order'
import { PersonalOrderRepository } from '#server/repositories/OrderRepository'

// 取得單筆訂單
export default defineEventHandler(async (event) => {
    const orderId = getRouterParam(event, 'orderId')
    if (!orderId) {
        throw createError({
            statusCode: 400,
            message: '缺少訂單 ID'
        })
    }
    try {
        // 直接取出指定訂單ID資料
        const data: OrderData = await PersonalOrderRepository.findByOrderId(orderId).then(
            (res) => ({
                ...res,
                orderId: orderId,
                orderList: Object.entries(res.orderList)
                    .map(([productId, orderItem]) => ({
                        productId,
                        ...orderItem
                    }))
                    .sort((a, b) => a.productId.localeCompare(b.productId))
            })
        )

        return {
            success: true,
            data,
            message: '取得訂單成功'
        }
    } catch (error: unknown) {
        throw createError({
            statusCode: 500,
            message: error instanceof Error ? error.message : 'Internal Server Error'
        })
    }
})
