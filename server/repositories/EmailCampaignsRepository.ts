import type { MailLogsByEmail } from '~/types/mail'

// push() = 產生唯一 key
// set() = 寫入資料
// update() = 更新資料
// remove() = 刪除資料

export const EmailCampaignsRepository = {
    async findById(id: string): Promise<MailLogsByEmail> {
        const snapshot = await db.ref(`emailCampaigns/${id}`).get()
        return snapshot.val() || {}
    },
    async deleteLog(campaignId: string, emailKey: string, mailId: string) {
        await db.ref(`emailCampaigns/${campaignId}/${emailKey}/${mailId}`).remove()
    }
}
