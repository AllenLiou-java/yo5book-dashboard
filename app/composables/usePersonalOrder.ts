import { OrderService } from '~/domain/services/OrderService'
import { PersonalOrderRepository } from '~/domain/repositories/OrderRepository'
import type { OrderData } from '~/types/order'

export const usePersonalOrder = () => {
    const orderService = new OrderService()
    const orderRepository = new PersonalOrderRepository()

    const createOrder = (data: Partial<OrderData>) => {
        return orderService.createOrder(data)
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
        createOrder,
        findAll,
        findByOrderId,
        update
    }
}
