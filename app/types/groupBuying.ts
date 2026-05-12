// 主結構：團購資料 (Root Object)
export interface GroupBuyingData {
    gid?: string // 團購 ID
    status?: 'active' | 'ended'
    buildTime?: number // Unix Timestamp
    unitName: string // 例如 "南區會計師公會"
    isLaunched: boolean // 總開關
    title: string
    bannerUrl: string
    endDate: string
    description: string
    products: GroupBuyingProducts | GroupBuyingProduct[]
}

// 定義單一產品結構
export interface GroupBuyingProduct {
    productId?: string
    name: string
    originalPrice: number
    groupPrice: number
    isLaunched?: boolean
}

// products 節點
export type GroupBuyingProducts = Record<string, GroupBuyingProduct>

// 定義團購表單
export type FormState = {
    unitName: string
    title: string
    bannerUrl: string
    description?: string
    endDate: string
    isLaunched: boolean
    products: GroupBuyingProduct[]
}
