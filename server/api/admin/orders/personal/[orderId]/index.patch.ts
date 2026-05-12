import type { ApiResponse } from '~/types/api'
import { PersonalOrderRepository } from '#server/repositories/OrderRepository'

// 局部更新訂單內容
export default defineEventHandler(async (event): Promise<ApiResponse<object>> => {
    const orderId = getRouterParam(event, 'orderId')
    const body = await readBody(event)
    const { data: orderDetail } = body

    if (!orderId || !orderDetail) {
        throw createError({
            statusCode: 400,
            statusMessage: '參數不完整'
        })
    }

    try {
        await PersonalOrderRepository.update(orderId, orderDetail)

        return {
            success: true,
            data: {},
            message: '修改訂單完成'
        }
    } catch (error: unknown) {
        throw createError({
            statusCode: 500,
            statusMessage: error instanceof Error ? error.message : '更新失敗'
        })
    }
})
