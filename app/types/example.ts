// 1. 定義公司登記的狀態（只能是這三種字串之一）
export type RegistrationStatus = 'pending' | 'approved' | 'rejected'

// 2. 定義公司資料的標準格式 (Interface)
export interface CompanyInfo {
    taxId: string // 統一編號
    name: string // 公司名稱
    capital: number // 資本額
    status: RegistrationStatus
    isReadyForBusiness: boolean
}
