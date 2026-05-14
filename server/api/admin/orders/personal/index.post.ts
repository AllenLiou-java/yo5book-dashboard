import type { OrderItem } from '~/types/order'
import type { ApiResponse } from '~/types/api'
import { PersonalOrderRepository } from '#server/repositories/OrderRepository'

// 新增/建立個人訂單
export default defineEventHandler(async (event): Promise<ApiResponse<object>> => {
    try {
        const body = await readBody(event)
        const bodyData = body?.data
        const { orderId, ...orderDetail } = bodyData

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

        if (!orderId || !orderDetail) {
            throw createError({
                statusCode: 400,
                statusMessage: '參數不完整'
            })
        }

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
            statusMessage: error instanceof Error ? error.message : 'Internal Server Error'
        })
    }
})
