export type OrdersDB = Record<
    string, // userId
    Record<string, OrderData> // orderId
>

export interface OrderData {
    bankAccountNo: string
    buyer: string
    delivery: Delivery
    email: string
    orderDate: number
    orderList: OrderItem[]
    phone: string
    receiver: Receiver
    remark: string
    status: string
    taxId: string
    totalPrice: number
    userId?: string
    groupId?: string
    orderId?: string
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
    productId?: string
    qty: number
    unitPrice: number
}
