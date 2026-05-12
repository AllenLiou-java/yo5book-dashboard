import type { GroupBuyingData, FormState } from '~/types/groupBuying'
import type { ApiResponse } from '~/types/api'

export class GroupBuyingRepository {
    findAll() {
        return $fetch<Promise<ApiResponse<GroupBuyingData[]>>>('/api/admin/groupBuying')
    }

    findByGroupId(groupId: string) {
        return $fetch<Promise<ApiResponse<GroupBuyingData>>>(`/api/admin/groupBuying/${groupId}`)
    }

    update(groupId: string, data: Partial<GroupBuyingData>) {
        return $fetch<Promise<ApiResponse<GroupBuyingData>>>(`/api/admin/groupBuying/${groupId}`, {
            method: 'PATCH',
            body: data
        })
    }

    create(data: FormState) {
        return $fetch<Promise<ApiResponse<GroupBuyingData>>>('/api/admin/groupBuying', {
            method: 'POST',
            body: data
        })
    }

    delete(groupId: string) {
        return $fetch<Promise<ApiResponse<GroupBuyingData>>>(`/api/admin/groupBuying/${groupId}`, {
            method: 'DELETE'
        })
    }
}
