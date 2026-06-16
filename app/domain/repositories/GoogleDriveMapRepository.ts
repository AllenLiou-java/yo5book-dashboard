import type { MapData } from '~/types/googleDriveMap'
import type { ApiResponse } from '~/types/api'

export class GoogleDriveMapRepository {
    findAll() {
        return $fetch<Promise<ApiResponse<Record<string, MapData>>>>('/api/googleDrive/fileIdMap')
    }

    findByFolderName(follderName: string) {
        return $fetch<Promise<ApiResponse<MapData>>>(`/api/googleDrive/fileIdMap/${follderName}`)
    }

    // update(groupId: string, data: Partial<GroupBuyingData>) {
    //     return $fetch<Promise<ApiResponse<GroupBuyingData>>>(`/api/admin/groupBuying/${groupId}`, {
    //         method: 'PATCH',
    //         body: data
    //     })
    // }

    // create(data: FormState) {
    //     return $fetch<Promise<ApiResponse<GroupBuyingData>>>('/api/admin/groupBuying', {
    //         method: 'POST',
    //         body: data
    //     })
    // }

    // delete(groupId: string) {
    //     return $fetch<Promise<ApiResponse<GroupBuyingData>>>(`/api/admin/groupBuying/${groupId}`, {
    //         method: 'DELETE'
    //     })
    // }
}
