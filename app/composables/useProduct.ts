import { ProductSimpleRepository } from '~/domain/repositories/ProductRepository'
import type { ProductSimple } from '~/types/product'

export const useProductSimple = () => {
    const productSimpleRepository = new ProductSimpleRepository()
    // In the top level of the composable, call useRequestFetch, which is a valid context
    const requestFetch = useRequestFetch()

    const findAll = () => {
        return productSimpleRepository.findAll(requestFetch)
    }

    const findByProductId = (productId: string) => {
        return productSimpleRepository.findByProductId(requestFetch, productId)
    }

    const update = (productId: string, data: Partial<ProductSimple>) => {
        return productSimpleRepository.update(requestFetch, productId, data)
    }

    const create = (data: ProductSimple) => {
        return productSimpleRepository.create(requestFetch, data)
    }

    const remove = (productId: string) => {
        return productSimpleRepository.delete(requestFetch, productId)
    }

    return {
        findAll,
        findByProductId,
        update,
        create,
        remove
    }
}
