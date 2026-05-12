import type { GroupBuyingData } from '~/types/groupBuying'

// push() = 產生唯一 key
// set() = 寫入資料
// update() = 更新資料
// remove() = 刪除資料

export const GroupBuyingRepository = {
    async findAll(): Promise<Record<string, GroupBuyingData>> {
        const snapshot = await db.ref(`groupBuyings`).get()
        return snapshot.val() || {}
    },
    async findByGroupId(groupId: string): Promise<GroupBuyingData> {
        const snapshot = await db.ref(`groupBuyings/${groupId}`).get()
        return snapshot.val() || {}
    },
    async update(groupId: string, data: Partial<GroupBuyingData>) {
        await db.ref(`groupBuyings/${groupId}`).update(data)
    },
    async create(data: GroupBuyingData): Promise<string | undefined> {
        // 透過 JSON 轉換快速過濾掉物件中的 undefined 屬性，避免 Firebase 寫入時拋出例外錯誤
        const cleanData = JSON.parse(JSON.stringify(data))

        // 將 push 與寫入合併，等待寫入完成後取得 Reference
        const newRef = await db.ref('groupBuyings').push(cleanData)

        // 處理 .key 可能為 null 的情況，確保回傳 string | undefined
        return newRef.key ?? undefined
    },
    async delete(groupId: string) {
        await db.ref(`groupBuyings/${groupId}`).remove()
    }
}
