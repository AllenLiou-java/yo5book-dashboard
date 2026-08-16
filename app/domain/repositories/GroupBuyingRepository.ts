import type { GroupBuyingData, FormState } from '~/types/groupBuying'
import type { ApiResponse } from '~/types/api'

// Helper type for the request fetcher function
type RequestFetch = <T>(...args: Parameters<typeof $fetch>) => Promise<T>

export class GroupBuyingRepository {
    findAll(requestFetch: RequestFetch) {
        return requestFetch<ApiResponse<GroupBuyingData[]>>('/api/admin/groupBuying')
    }

    findByGroupId(requestFetch: RequestFetch, groupId: string) {
        return requestFetch<ApiResponse<GroupBuyingData>>(`/api/admin/groupBuying/${groupId}`)
    }

    update(requestFetch: RequestFetch, groupId: string, data: Partial<GroupBuyingData>) {
        return requestFetch<ApiResponse<GroupBuyingData>>(`/api/admin/groupBuying/${groupId}`, {
            method: 'PATCH',
            body: data
        })
    }

    create(requestFetch: RequestFetch, data: FormState) {
        return requestFetch<ApiResponse<GroupBuyingData>>('/api/admin/groupBuying', {
            method: 'POST',
            body: data
        })
    }

    delete(requestFetch: RequestFetch, groupId: string) {
        return requestFetch<ApiResponse<GroupBuyingData>>(`/api/admin/groupBuying/${groupId}`, {
            method: 'DELETE'
        })
    }
}
