import type { MapData } from '~/types/googleDriveMap'
import type { ApiResponse } from '~/types/api'
import { GoogleDriveMapRepository } from '#server/repositories/GoogleDriveMapRepository'

export default defineEventHandler(async (event): Promise<ApiResponse<MapData>> => {
    const folderName = getRouterParam(event, 'folderName')
    if (!folderName) {
        throw createError({ statusCode: 400, message: '未指定存取的資料夾名稱' })
    }

    try {
        const snapshotVal = await GoogleDriveMapRepository.findByFolderName(folderName)

        return {
            success: true,
            data: snapshotVal,
            message: '成功取得GoogleDrive存取路徑'
        }
    } catch (error: unknown) {
        throw createError({
            statusCode: 500,
            statusMessage: error instanceof Error ? error.message : 'Internal Server Error'
        })
    }
})
