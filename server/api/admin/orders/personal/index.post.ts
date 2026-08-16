import type { OrderItem } from '~/types/order'
import type { ApiResponse } from '~/types/api'
import { PersonalOrderRepository } from '#server/repositories/OrderRepository'

// 新增/建立個人訂單
export default defineEventHandler(async (event): Promise<ApiResponse<object>> => {
    try {
        const body = await readBody(event)
        const bodyData = body?.data
        const { orderId, ...orderDetail } = bodyData

        if (!orderId || !orderDetail) {
            throw createError({
                statusCode: 400,
                message: '參數不完整'
            })
        }

        // 轉換orderDetail中的orderList
        orderDetail.orderList = orderDetail.orderList
            .sort((a: OrderItem, b: OrderItem) =>
                (a.productId || '').localeCompare(b.productId || '')
            )
            .reduce((acc: Record<string, Omit<OrderItem, 'productId'>>, item: OrderItem) => {
                const { productId, ...rest } = item as Required<OrderItem>

                acc[productId] = rest

                return acc
            }, {})

        // 寫入訂單資料
        await PersonalOrderRepository.create(orderId, bodyData)

        return {
            success: true,
            data: {},
            message: '建立訂單成功'
        }
    } catch (error: unknown) {
        throw createError({
            statusCode: 500,
            message: error instanceof Error ? error.message : 'Internal Server Error'
        })
    }
})
