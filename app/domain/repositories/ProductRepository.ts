import type { ProductSimple } from '~/types/product'
import type { ApiResponse } from '~/types/api'

export class ProductSimpleRepository {
    findAll() {
        return $fetch<Promise<ApiResponse<ProductSimple[]>>>('/api/admin/products')
    }

    findByGroupId(productId: string) {
        return $fetch<Promise<ApiResponse<ProductSimple>>>(`/api/admin/products/${productId}`)
    }

    update(productId: string, data: Partial<ProductSimple>) {
        return $fetch(`/api/admin/products/${productId}`, {
            method: 'PATCH',
            body: data
        })
    }

    create(data: ProductSimple) {
        return $fetch<Promise<ApiResponse<string>>>('/api/admin/products', {
            method: 'POST',
            body: data
        })
    }

    delete(productId: string) {
        return $fetch(`/api/admin/products/${productId}`, {
            method: 'DELETE'
        })
    }
}
