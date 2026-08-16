import type { MapData } from '~/types/googleDriveMap'
import type { ApiResponse } from '~/types/api'
import { GoogleDriveMapRepository } from '#server/repositories/GoogleDriveMapRepository'

export default defineEventHandler(async (): Promise<ApiResponse<Record<string, MapData>>> => {
    try {
        const snapshotVal = await GoogleDriveMapRepository.findAll()

        return {
            success: true,
            data: snapshotVal,
            message: '取得GoogleDriveMap成功'
        }
    } catch (error: unknown) {
        throw createError({
            statusCode: 500,
            message: error instanceof Error ? error.message : 'Internal Server Error'
        })
    }
})
