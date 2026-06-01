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

    create(data: OrderData) {
        return $fetch<Promise<ApiResponse<OrderData>>>('/api/admin/orders/personal', {
            method: 'POST',
            body: {
                data
            }
        })
    }
}

export class GroupOrderRepository {
    findByGroupId(groupId: string) {
        return $fetch<Promise<ApiResponse<OrderData[]>>>(`/api/admin/orders/group/${groupId}`)
    }

    findByOrderId(groupId: string, orderId: string) {
        return $fetch<Promise<ApiResponse<OrderData>>>(
            `/api/admin/orders/group/${groupId}/${orderId}`
        )
    }

    update(groupId: string, orderId: string, data: Partial<OrderData>) {
        return $fetch<Promise<ApiResponse<OrderData>>>(
            `/api/admin/orders/group/${groupId}/${orderId}`,
            {
                method: 'PATCH',
                body: {
                    data
                }
            }
        )
    }

    create(groupId: string, data: OrderData) {
        return $fetch<Promise<ApiResponse<OrderData>>>(`/api/admin/orders/group/${groupId}`, {
            method: 'POST',
            body: {
                data
            }
        })
    }
}
