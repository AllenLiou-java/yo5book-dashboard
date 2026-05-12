import { ProductSimpleRepository } from '~/domain/repositories/ProductRepository'
import type { ProductSimple } from '~/types/product'

export const useProductSimple = () => {
    const productSimpleRepository = new ProductSimpleRepository()

    const findAll = () => {
        return productSimpleRepository.findAll()
    }

    const findByGroupId = (productId: string) => {
        return productSimpleRepository.findByGroupId(productId)
    }

    const update = (productId: string, data: Partial<ProductSimple>) => {
        return productSimpleRepository.update(productId, data)
    }

    const create = (data: ProductSimple) => {
        return productSimpleRepository.create(data)
    }

    const remove = (productId: string) => {
        return productSimpleRepository.delete(productId)
    }

    return {
        findAll,
        findByGroupId,
        update,
        create,
        remove
    }
}
