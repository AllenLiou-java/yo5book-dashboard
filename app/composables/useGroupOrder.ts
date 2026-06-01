import { GroupOrderRepository } from '~/domain/repositories/OrderRepository'
import type { OrderData } from '~/types/order'

export const useGroupOrder = () => {
    const orderRepository = new GroupOrderRepository()

    const create = (groupId: string, data: OrderData) => {
        return orderRepository.create(groupId, data)
    }

    const findByGroupId = (orderId: string) => {
        return orderRepository.findByGroupId(orderId)
    }

    const findByOrderId = (groupId: string, orderId: string) => {
        return orderRepository.findByOrderId(groupId, orderId)
    }

    const update = (groupId: string, orderId: string, data: Partial<OrderData>) => {
        return orderRepository.update(groupId, orderId, data)
    }

    return {
        create,
        findByGroupId,
        findByOrderId,
        update
    }
}
