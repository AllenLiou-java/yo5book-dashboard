import type { OrderData } from '~/types/order'
import { PersonalOrderRepository } from '#server/repositories/OrderRepository'

// 取得全部訂單
export default defineEventHandler(async () => {
    try {
        // 直接取出所有訂單資料
        const snapshotVal = await PersonalOrderRepository.findAll()

        // 將 Object 轉換為 Array，並注入 orderId
        const data: OrderData[] = Object.entries(snapshotVal || {})
            .map(([orderId, order]) => ({
                ...order,
                orderId,
                // 確保 orderList 存在以防 Firebase 缺漏，並避免變數命名衝突 (order 改為 orderItem)
                orderList: order.orderList
                    ? Object.entries(order.orderList)
                          .map(([productId, orderItem]) => ({
                              productId,
                              ...orderItem
                          }))
                          .sort((a, b) => a.productId.localeCompare(b.productId))
                    : []
            }))
            .sort((a, b) => (b.orderDate || 0) - (a.orderDate || 0)) // 依照 orderDate 排序 (由新到舊降冪排序)

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
