export interface BookIntroduction {
    detail: string[]
    overview: string[]
    primaryColor: string
    slogan: string
    summary: string[]
}

export interface ErratumItem {
    chapter: string
    content: string[]
    extension: string
    fileId: string
    fileName: string
    postDate: string
    title: string
}

export interface Price {
    discount: number
    originalPrice: number
}

// export interface PriceDetail {
//     discount: number
//     originalPrice: number
//     promote?: number // 未來刪除此屬性
//     discountList?: Record<string, number> // 未來刪除此屬性
// }

// 未來刪除此屬性
export interface PriceListItem {
    price: number
    title: string
}

// 未來刪除此屬性
export interface Plan {
    content: string[] | string
    isShow: boolean
    priceList: PriceListItem[]
    type: 'person' | 'group'
}

interface BaseProduct {
    productId: string
    name: string
    imgSrc: string
    launched: boolean
}

export interface ProductDetail extends BaseProduct {
    isFromGroup?: boolean

    bookIntroduction: BookIntroduction

    content: string[]

    erratum: ErratumItem[] | ''

    notice: string[] | ''

    plans?: Plan[] | '' // 未來刪除此屬性

    price: Price
}

// 對應products_simple
export interface ProductSimple extends BaseProduct {
    isNew: boolean
    isOnSale: boolean
    price: Price
}

export type ProductDetailMap = Record<string, ProductDetail>

export type ProductSimpleMap = Record<string, ProductSimple>
