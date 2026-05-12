export type OrdersDB = Record<
    string, // userId
    Record<string, OrderData> // orderId
>

export interface OrderData {
    bankAccountNo: string
    buyer: string
    delivery: Delivery
    email: string
    isClosed: boolean
    orderDate: number
    orderList: OrderItem[]
    phone: string
    receiver: Receiver
    remark: string
    status: string
    taxId: string
    totalPrice: number
    userId?: string
    orderId?: string
    oderDate?: string
    isFromGroup?: boolean
}

export interface Delivery {
    company: string
    trackingNo: string
    trackingUrl: string
}

export interface Receiver {
    name: string
    address: string
}

export interface OrderItem {
    productName: string
    qty: number
    unitPrice: number
    totalPrice: number
    productId?: string
    content?: string[]
    imgSrc?: string
}
