import type { OrderData } from '~/types/order'
import { GroupOrderRepository } from '#server/repositories/OrderRepository'

// 取得單筆訂單
export default defineEventHandler(async (event) => {
    const groupId = getRouterParam(event, 'groupId')
    if (!groupId) {
        throw createError({
            statusCode: 400,
            message: '缺少訂單 ID'
        })
    }
    try {
        const snapshotVal = await GroupOrderRepository.findByGroupId(groupId)

        const data: OrderData[] = Object.entries(snapshotVal || {})
            .map(([orderId, order]) => ({
                ...order,
                orderId,
                groupId,
                orderList: Object.entries(order.orderList || {})
                    .map(([productId, orderItem]) => ({
                        productId,
                        ...orderItem
                    }))
                    .sort((a, b) => (a.productId || '').localeCompare(b.productId || ''))
            }))
            .sort((a, b) => (b.orderDate || 0) - (a.orderDate || 0))

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
