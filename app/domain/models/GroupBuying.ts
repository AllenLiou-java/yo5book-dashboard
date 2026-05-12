export class GroupBuying {
    gid?: string
    status?: 'active' | 'ended'
    buildTime?: number
    unitName: string
    isLaunched: boolean
    title: string
    bannerUrl: string
    endDate: string
    description: string
    products: {
        productId: string
        name: string
        originalPrice: number
        groupPrice: number
        isLaunched?: boolean
    }[]

    constructor(data: Partial<GroupBuying>) {
        this.gid = data.gid
        this.status = data.status || 'active'
        this.buildTime = data.buildTime || Date.now()
        this.unitName = data.unitName || ''
        this.isLaunched = data.isLaunched ?? false
        this.title = data.title || ''
        this.bannerUrl = data.bannerUrl || ''
        this.endDate = data.endDate || ''
        this.description = data.description || ''
        this.products = data.products || []
    }
}
