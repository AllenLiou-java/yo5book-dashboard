import type { MailLog } from '~/types/mail'
import type { ApiResponse } from '~/types/api'

// Helper type for the request fetcher function
type RequestFetch = <T>(...args: Parameters<typeof $fetch>) => Promise<T>

export class EmailCampaignsRepository {
    findById(requestFetch: RequestFetch, id: string) {
        return requestFetch<ApiResponse<MailLog[]>>(`/api/mail/campaigns/${id}`)
    }

    deleteLog(requestFetch: RequestFetch, campaignId: string, emailKey: string, mailId: string) {
        return requestFetch<ApiResponse<null>>(`/api/mail/campaigns/${campaignId}/log`, {
            method: 'DELETE',
            query: { emailKey, mailId }
        })
    }
}
