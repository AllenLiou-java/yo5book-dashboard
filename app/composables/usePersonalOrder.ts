import { PersonalOrderRepository } from '~/domain/repositories/OrderRepository'
import type { OrderData } from '~/types/order'

export const usePersonalOrder = () => {
    const orderRepository = new PersonalOrderRepository()

    const create = (data: OrderData) => {
        return orderRepository.create(data)
    }

    const findAll = () => {
        return orderRepository.findAll()
    }

    const findByOrderId = (orderId: string) => {
        return orderRepository.findByOrderId(orderId)
    }

    const update = (orderId: string, data: Partial<OrderData>) => {
        return orderRepository.update(orderId, data)
    }

    return {
        create,
        findAll,
        findByOrderId,
        update
    }
}
