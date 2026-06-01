import type { OrderData } from '~/types/order'

// 將巢狀物件扁平化，轉為 Firebase 支援的路徑格式 (例如 'receiver/address')
function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
    return Object.keys(obj).reduce((acc: Record<string, unknown>, key: string) => {
        const pre = prefix.length ? prefix + '/' : ''
        const value = obj[key]
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            Object.assign(acc, flattenObject(value as Record<string, unknown>, pre + key))
        } else {
            acc[pre + key] = value
        }
        return acc
    }, {})
}

export const PersonalOrderRepository = {
    // 使用 OrderData 型別
    async create(orderId: string, data: OrderData): Promise<void> {
        const cleanData = JSON.parse(JSON.stringify(data))
        await db.ref(`personalOrders/${orderId}`).set(cleanData)
    },

    async findAll(): Promise<Record<string, OrderData>> {
        const snapshot = await db.ref(`personalOrders`).get()
        return snapshot.val() || {}
    },

    async findByOrderId(orderId: string): Promise<OrderData> {
        const snapshot = await db.ref(`personalOrders/${orderId}`).get()
        return snapshot.val() || {}
    },

    async update(orderId: string, data: Partial<OrderData>) {
        const flatData = flattenObject(data)
        await db.ref(`personalOrders/${orderId}`).update(flatData)
    }

    // async delete(orderId: string) {
    //     await db.ref(`personalOrders/${orderId}`).remove()
    // }
}

export const GroupOrderRepository = {
    // 使用 OrderData 型別
    async create(groupId: string, orderId: string, data: OrderData): Promise<void> {
        const cleanData = JSON.parse(JSON.stringify(data))
        await db.ref(`groupOrders/${groupId}/${orderId}`).set(cleanData)
    },

    async findByGroupId(groupId: string): Promise<Record<string, OrderData>> {
        const snapshot = await db.ref(`groupOrders/${groupId}`).get()
        return snapshot.val() || {}
    },

    async findByOrderId(groupId: string, orderId: string): Promise<OrderData> {
        const snapshot = await db.ref(`groupOrders/${groupId}/${orderId}`).get()
        return snapshot.val() || {}
    },

    async update(groupId: string, orderId: string, data: Partial<OrderData>) {
        const flatData = flattenObject(data)
        await db.ref(`groupOrders/${groupId}/${orderId}`).update(flatData)
    }

    // async delete(orderId: string) {
    //     await db.ref(`groupOrders${groupId}/${orderId}`).remove()
    // }
}
