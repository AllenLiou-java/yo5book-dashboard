import type { OrderData } from '~/types/order'
import type { ApiResponse } from '~/types/api'

export class PersonalOrderRepository {
    findAll() {
        return $fetch<Promise<ApiResponse<OrderData[]>>>('/api/admin/orders/personal')
    }

    findByOrderId(orderId: string) {
        return $fetch<Promise<ApiResponse<OrderData>>>(`/api/admin/orders/personal/${orderId}`)
    }

    update(orderId: string, data: Partial<OrderData>) {
        return $fetch<Promise<ApiResponse<OrderData>>>(`/api/admin/orders/personal/${orderId}`, {
            method: 'PATCH',
            body: {
                data
            }
        })
    }
}
