import type { OrderData } from '~/types/order'
import { GroupOrderRepository } from '#server/repositories/OrderRepository'

// 取得單筆訂單
export default defineEventHandler(async (event) => {
    const groupId = getRouterParam(event, 'groupId')
    const orderId = getRouterParam(event, 'orderId')
    if (!groupId) {
        throw createError({
            statusCode: 400,
            message: '缺少團購 ID'
        })
    }
    if (!orderId) {
        throw createError({
            statusCode: 400,
            message: '缺少訂單 ID'
        })
    }

    try {
        const snapshotVal = await GroupOrderRepository.findByOrderId(groupId, orderId)

        const data: OrderData = {
            ...snapshotVal,
            orderId,
            groupId,
            orderList: Object.entries(snapshotVal.orderList || {})
                .map(([productId, orderItem]) => ({
                    productId,
                    ...orderItem
                }))
                .sort((a, b) => (a.productId || '').localeCompare(b.productId || ''))
        }

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
