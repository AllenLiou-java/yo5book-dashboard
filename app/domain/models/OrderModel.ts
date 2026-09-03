import type { OrderData, OrderItem } from '~/types/order'
export class OrderModel {
    userId?: string
    orderId: string
    buyer: string
    email: string
    phone: string
    status: string
    totalPrice: number
    orderDate: number | null
    bankAccountNo: string
    taxId: string
    remark: string
    delivery: {
        company: string
        trackingNo: string
        trackingUrl: string
    }
    receiver: {
        name: string
        address: string
    }
    orderList: OrderItem[]

    constructor(data: Partial<OrderData>) {
        this.userId = data.userId
        this.orderId = data.orderId || ''
        this.buyer = data.buyer || ''
        this.email = data.email || ''
        this.phone = data.phone || ''
        this.status = data.status || ''
        this.totalPrice = data.totalPrice || 0
        this.orderDate = data.orderDate || null
        this.bankAccountNo = data.bankAccountNo || ''
        this.taxId = data.taxId || ''
        this.remark = data.remark || ''
        this.delivery = data.delivery || { company: '', trackingNo: '', trackingUrl: '' }
        this.receiver = data.receiver || { name: '', address: '' }
        this.orderList = data.orderList || []
    }

    setUserId = (userId: string) => {
        this.userId = userId
    }
    setOrderId = (orderId: string) => {
        this.orderId = orderId
    }
    setBuyer = (buyer: string) => {
        this.buyer = buyer
    }
    setEmail = (email: string) => {
        this.email = email
    }
    setPhone = (phone: string) => {
        this.phone = phone
    }
    setStatus = (status: string) => {
        this.status = status
    }
    setTotalPrice = (totalPrice: number) => {
        this.totalPrice = totalPrice
    }
    setOrderDate = (orderDate: number | null) => {
        this.orderDate = orderDate
    }
    setBankAccountNo = (bankAccountNo: string) => {
        this.bankAccountNo = bankAccountNo
    }
    setTaxId = (taxId: string) => {
        this.taxId = taxId
    }
    setRemark = (remark: string) => {
        this.remark = remark
    }
    setDelivery = (deliveryInfo: { company: string; trackingNo: string; trackingUrl: string }) => {
        this.delivery = deliveryInfo
    }
    setReceiver = (receiverInfo: { name: string; address: string }) => {
        this.receiver = receiverInfo
    }
    setOrderList = (order: OrderItem) => {
        this.orderList.push(order)
    }
}
