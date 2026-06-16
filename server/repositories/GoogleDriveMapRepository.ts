import type { MapData } from '~/types/googleDriveMap'

// push() = 產生唯一 key
// set() = 寫入資料
// update() = 更新資料
// remove() = 刪除資料

export const GoogleDriveMapRepository = {
    async findAll(): Promise<Record<string, MapData>> {
        const snapshot = await db.ref(`googleDriveMap`).get()
        return snapshot.val() || {}
    },
    async findByFolderName(folderName: string): Promise<MapData> {
        const snapshot = await db.ref(`googleDriveMap/${folderName}`).get()
        return snapshot.val() || {}
    },
    async update(type: string, data: Partial<MapData>) {
        await db.ref(`googleDriveMap/${type}`).update(data)
    },
    async create(data: MapData): Promise<string | undefined> {
        // 透過 JSON 轉換快速過濾掉物件中的 undefined 屬性，避免 Firebase 寫入時拋出例外錯誤
        const cleanData = JSON.parse(JSON.stringify(data))

        // 將 push 與寫入合併，等待寫入完成後取得 Reference
        const newRef = await db.ref('googleDriveMap').push(cleanData)

        // 處理 .key 可能為 null 的情況，確保回傳 string | undefined
        return newRef.key ?? undefined
    },
    async delete(type: string) {
        await db.ref(`googleDriveMap/${type}`).remove()
    }
}
