import type { OrderData } from '~/types/order'
import { PersonalOrderRepository } from '#server/repositories/OrderRepository'

// 新增/建立個人訂單
export default defineEventHandler(async (event) => {
    const body = await readBody<{ orderId?: string; data?: OrderData }>(event)
    const orderId = body?.orderId
    const orderDetail = body?.data

    if (!orderId || !orderDetail) {
        throw createError({
            statusCode: 400,
            statusMessage: '參數不完整'
        })
    }

    try {
        // 寫入訂單資料
        await PersonalOrderRepository.create(orderId, orderDetail)

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
