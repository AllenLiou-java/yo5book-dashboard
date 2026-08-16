import type { OrderData } from '~/types/order'
import type { ApiResponse } from '~/types/api'

// Helper type for the request fetcher function
type RequestFetch = <T>(...args: Parameters<typeof $fetch>) => Promise<T>

export class PersonalOrderRepository {
    findAll(requestFetch: RequestFetch) {
        return requestFetch<ApiResponse<OrderData[]>>('/api/admin/orders/personal')
    }

    findByOrderId(requestFetch: RequestFetch, orderId: string) {
        return requestFetch<ApiResponse<OrderData>>(`/api/admin/orders/personal/${orderId}`)
    }

    update(requestFetch: RequestFetch, orderId: string, data: Partial<OrderData>) {
        return requestFetch<ApiResponse<OrderData>>(`/api/admin/orders/personal/${orderId}`, {
            method: 'PATCH',
            body: {
                data
            }
        })
    }

    create(requestFetch: RequestFetch, data: OrderData) {
        return requestFetch<ApiResponse<OrderData>>('/api/admin/orders/personal', {
            method: 'POST',
            body: {
                data
            }
        })
    }
}

export class GroupOrderRepository {
    findByGroupId(requestFetch: RequestFetch, groupId: string) {
        return requestFetch<ApiResponse<OrderData[]>>(`/api/admin/orders/group/${groupId}`)
    }

    findByOrderId(requestFetch: RequestFetch, groupId: string, orderId: string) {
        return requestFetch<ApiResponse<OrderData>>(`/api/admin/orders/group/${groupId}/${orderId}`)
    }

    update(requestFetch: RequestFetch, groupId: string, orderId: string, data: Partial<OrderData>) {
        return requestFetch<ApiResponse<OrderData>>(
            `/api/admin/orders/group/${groupId}/${orderId}`,
            {
                method: 'PATCH',
                body: {
                    data
                }
            }
        )
    }

    create(requestFetch: RequestFetch, groupId: string, data: OrderData) {
        return requestFetch<ApiResponse<OrderData>>(`/api/admin/orders/group/${groupId}`, {
            method: 'POST',
            body: {
                data
            }
        })
    }
}
