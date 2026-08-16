import type { ProductSimple } from '~/types/product'
import type { ApiResponse } from '~/types/api'

// Helper type for the request fetcher function
type RequestFetch = <T>(...args: Parameters<typeof $fetch>) => Promise<T>

export class ProductSimpleRepository {
    findAll(requestFetch: RequestFetch) {
        return requestFetch<ApiResponse<ProductSimple[]>>('/api/admin/products')
    }

    findByProductId(requestFetch: RequestFetch, productId: string) {
        return requestFetch<ApiResponse<ProductSimple>>(`/api/admin/products/${productId}`)
    }

    update(requestFetch: RequestFetch, productId: string, data: Partial<ProductSimple>) {
        return requestFetch<ApiResponse<ProductSimple>>(`/api/admin/products/${productId}`, {
            method: 'PATCH',
            body: data
        })
    }

    create(requestFetch: RequestFetch, data: ProductSimple) {
        return requestFetch<ApiResponse<string>>('/api/admin/products', {
            method: 'POST',
            body: data
        })
    }

    delete(requestFetch: RequestFetch, productId: string) {
        return requestFetch<ApiResponse<null>>(`/api/admin/products/${productId}`, {
            method: 'DELETE'
        })
    }
}
