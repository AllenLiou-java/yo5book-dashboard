import type { OrderData } from '~/types/order'
import { OrderModel } from '~/domain/models/OrderModel'

export class OrderService {
    createOrder(data: Partial<OrderData>) {
        const order = new OrderModel(data)
        if (!order.userId) {
            throw new Error('userId is required')
        }

        return order
    }
}
