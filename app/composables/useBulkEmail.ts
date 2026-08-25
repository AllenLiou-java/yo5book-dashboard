import type {
    EmailRecipient,
    SendBulkEmailOptions,
    SendBulkEmailResponse,
    BulkEmailResult
} from '~/types/mail'

import { EmailCampaignsRepository } from '~/domain/repositories/EmailCampaignsRepository'

const DEFAULT_BATCH_SIZE = 25
const DEFAULT_BATCH_DELAY = 5000

export const useBulkEmail = () => {
    const emailRepository = new EmailCampaignsRepository()
    const requestFetch = useRequestFetch()

    const loading = ref(false)

    const progress = ref({
        current: 0,
        total: 0
    })

    /**
     * 讀取 JSON 檔案
     */
    const parseJsonFile = (file: File): Promise<EmailRecipient[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()

            reader.onload = (event) => {
                try {
                    const result = JSON.parse(String(event.target?.result ?? ''))

                    if (!Array.isArray(result)) {
                        reject(new Error('JSON 格式必須是陣列'))
                        return
                    }

                    resolve(result)
                } catch {
                    reject(new Error('JSON 格式錯誤'))
                }
            }

            reader.onerror = () => {
                reject(new Error('無法讀取 JSON 檔案'))
            }

            reader.readAsText(file)
        })
    }

    /**
     * 分割陣列
     */
    const chunkArray = <T>(array: T[], size: number): T[][] => {
        const chunks: T[][] = []

        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size))
        }

        return chunks
    }

    /**
     * 延遲
     */
    const delay = (ms: number) => {
        return new Promise((resolve) => {
            setTimeout(resolve, ms)
        })
    }

    /**
     * 執行批次寄信
     */
    const sendEmails = async (options: SendBulkEmailOptions): Promise<BulkEmailResult> => {
        const { htmlFile, recipients, campaignType, idType, orgType, subjects } = options

        if (!htmlFile) {
            throw new Error('請上傳 HTML 信件內容')
        }

        if (!recipients.length) {
            throw new Error('收件人清單不可為空')
        }

        const validSubjects = subjects.filter((s) => s.trim() !== '')

        if (!validSubjects.length) {
            throw new Error('請至少輸入一筆郵件主旨')
        }

        loading.value = true

        progress.value = {
            current: 0,
            total: recipients.length
        }

        let totalSuccess = 0
        let totalFailed = 0

        const batches = chunkArray(recipients, DEFAULT_BATCH_SIZE)

        try {
            for (let i = 0; i < batches.length; i++) {
                const batch = batches[i]
                // Although 'chunkArray' and the loop condition should ensure 'batch' is always an array,
                // this check addresses a potential linter warning about 'batch' being undefined.
                if (!batch) {
                    continue // Skip if for some unexpected reason a batch is undefined
                }

                const formData = new FormData()

                formData.append('html', htmlFile)

                formData.append('recipients', JSON.stringify(batch))

                formData.append('campaignType', campaignType)

                formData.append('idType', idType)

                formData.append('orgType', orgType)

                formData.append('subjects', JSON.stringify(validSubjects))

                try {
                    const response = await $fetch<SendBulkEmailResponse>(
                        '/api/mail/send-bulk-email',
                        {
                            method: 'POST',
                            body: formData
                        }
                    )

                    totalSuccess += response.successCount
                    totalFailed += response.failedCount
                } catch (error) {
                    /**
                     * 整批 API 呼叫失敗
                     * 這種情況下，整批都視為失敗
                     */
                    totalFailed += batch.length

                    console.error(`第 ${i + 1} 批寄送失敗`, error)
                }

                /**
                 * 不管成功或失敗，
                 * 這一批都已經處理完畢
                 */
                progress.value.current += batch.length

                /**
                 * 批次之間等待
                 */
                if (i < batches.length - 1) {
                    await delay(DEFAULT_BATCH_DELAY)
                }
            }

            return {
                successCount: totalSuccess,
                failedCount: totalFailed
            }
        } finally {
            loading.value = false
        }
    }

    const findById = (id: string) => {
        return emailRepository.findById(requestFetch, id)
    }

    const removeMailLog = (campaignId: string, emailKey: string, mailId: string) => {
        return emailRepository.deleteLog(requestFetch, campaignId, emailKey, mailId)
    }

    return {
        loading,
        progress,
        parseJsonFile,
        sendEmails,
        findById,
        removeMailLog
    }
}
