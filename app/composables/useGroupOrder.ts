import { GroupOrderRepository } from '~/domain/repositories/OrderRepository'
import type { OrderData } from '~/types/order'

export const useGroupOrder = () => {
    const orderRepository = new GroupOrderRepository()
    // 在 composable 的頂層呼叫 useRequestFetch，這是有效的上下文
    const requestFetch = useRequestFetch()

    const create = (groupId: string, data: OrderData) => {
        return orderRepository.create(requestFetch, groupId, data)
    }

    const findByGroupId = (groupId: string) => {
        return orderRepository.findByGroupId(requestFetch, groupId)
    }

    const findByOrderId = (groupId: string, orderId: string) => {
        return orderRepository.findByOrderId(requestFetch, groupId, orderId)
    }

    const update = (groupId: string, orderId: string, data: Partial<OrderData>) => {
        return orderRepository.update(requestFetch, groupId, orderId, data)
    }

    return {
        create,
        findByGroupId,
        findByOrderId,
        update
    }
}
