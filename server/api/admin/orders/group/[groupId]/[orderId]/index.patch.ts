import type { ApiResponse } from '~/types/api'
import { GroupOrderRepository } from '#server/repositories/OrderRepository'

// 局部更新訂單內容
export default defineEventHandler(async (event): Promise<ApiResponse<object>> => {
    const groupId = getRouterParam(event, 'groupId')
    const orderId = getRouterParam(event, 'orderId')

    const body = await readBody(event)
    const { data: orderDetail } = body

    if (!orderId || !groupId || !orderDetail) {
        throw createError({
            statusCode: 400,
            message: '參數不完整'
        })
    }

    try {
        await GroupOrderRepository.update(groupId, orderId, orderDetail)

        return {
            success: true,
            data: {},
            message: '修改訂單完成'
        }
    } catch (error: unknown) {
        throw createError({
            statusCode: 500,
            message: error instanceof Error ? error.message : '更新失敗'
        })
    }
})
