export interface EmailRecipient {
    email: string
    name?: string
    [key: string]: unknown
}

export interface SendBulkEmailOptions {
    htmlFile: File
    recipients: EmailRecipient[]
    campaignType: string
    idType: string
    orgType: string
    subjects: string[]
}

export interface SendBulkEmailResponse {
    successCount: number
    failedCount: number
}

export interface BulkEmailResult {
    successCount: number
    failedCount: number
}

export interface MailLog {
    email: string
    name: string
    opened: boolean
    openedAt: number
    sentAt: number
    subject: string
    emailKey?: string
    mailId?: string
}

interface MailLogs {
    [mailId: string]: MailLog
}

export interface MailLogsByEmail {
    [email: string]: MailLogs
}
