import { PersonalOrderRepository } from '~/domain/repositories/OrderRepository'
import type { OrderData } from '~/types/order'

export const usePersonalOrder = () => {
    const orderRepository = new PersonalOrderRepository()
    // 在 composable 的頂層呼叫 useRequestFetch，這是有效的上下文
    const requestFetch = useRequestFetch()

    const create = (data: OrderData) => {
        return orderRepository.create(requestFetch, data)
    }

    const findAll = () => {
        return orderRepository.findAll(requestFetch)
    }

    const findByOrderId = (orderId: string) => {
        return orderRepository.findByOrderId(requestFetch, orderId)
    }

    const update = (orderId: string, data: Partial<OrderData>) => {
        return orderRepository.update(requestFetch, orderId, data)
    }

    return {
        create,
        findAll,
        findByOrderId,
        update
    }
}
