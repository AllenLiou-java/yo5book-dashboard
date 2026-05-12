import { defineStore } from 'pinia'
import type { OrderData } from '~/types/order'

export const useOrderStore = defineStore('order', () => {
    const personalOrderList = ref<OrderData[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const statusOptions = ref([
        { label: '待匯款', value: '1' },
        { label: '匯款完成，訂單準備中', value: '2' },
        { label: '已發貨', value: '3' },
        { label: '未匯款，訂單取消', value: '4' },
        { label: '訂單取消，退款完成', value: '5' }
    ])

    const personalOrder = usePersonalOrder()

    const fetchPersonalOrders = async () => {
        isLoading.value = true
        error.value = null

        try {
            const { data, success } = await personalOrder.findAll()

            if (success) {
                personalOrderList.value = data
            }
        } catch (err: unknown) {
            error.value = getErrorMessage(err, '無法取得訂單資料列表')
        } finally {
            isLoading.value = false
        }
    }

    const getPersonalOrderById = async (orderId: string) => {
        isLoading.value = true
        error.value = null

        if (personalOrderList.value.length > 0) {
            const data = personalOrderList.value.find((item) => item.orderId === orderId)
            if (data) return data
        }

        try {
            const { data } = await personalOrder.findByOrderId(orderId)
            personalOrderList.value.push(data)
            return data
        } catch (err: unknown) {
            error.value = getErrorMessage(err, '無法取得個人訂單資料')
        } finally {
            isLoading.value = false
        }
    }

    const updatePersonalOrder = async (orderId: string, updatedData: Partial<OrderData>) => {
        isLoading.value = true
        error.value = null

        try {
            await personalOrder.update(orderId, updatedData)
            // 將updatedData更新至 personalOrderList中指定對應資料
            const index = personalOrderList.value.findIndex((item) => item.orderId === orderId)
            if (index !== -1 && personalOrderList.value[index]) {
                const target = personalOrderList.value[index]!

                for (const [key, value] of Object.entries(updatedData)) {
                    const k = key as keyof OrderData
                    if (
                        value !== null &&
                        typeof value === 'object' &&
                        !Array.isArray(value) &&
                        target[k] !== null &&
                        typeof target[k] === 'object'
                    ) {
                        // 針對巢狀物件 (如 receiver, delivery) 進行物件合併，保留未更新的屬性
                        Object.assign(target[k] as object, value)
                    } else {
                        // 一般基本型別 (如 status, remark) 直接覆蓋
                        Object.assign(target, { [k]: value })
                    }
                }
            }
        } catch (err: unknown) {
            error.value = getErrorMessage(err, '更新狀態失敗')
        } finally {
            isLoading.value = false
        }
    }

    const updatePersonalOrderStatus = async (orderId: string, status: string) => {
        isLoading.value = true
        error.value = null

        try {
            await personalOrder.update(orderId, { status })
            const index = personalOrderList.value.findIndex((item) => item.orderId === orderId)
            if (index !== -1 && personalOrderList.value[index]) {
                personalOrderList.value[index].status = status
            }
        } catch (err: unknown) {
            error.value = getErrorMessage(err, '更新狀態失敗')
        } finally {
            isLoading.value = false
        }
    }

    return {
        personalOrderList,
        isLoading,
        error,
        statusOptions,
        fetchPersonalOrders,
        updatePersonalOrder,
        updatePersonalOrderStatus,
        getPersonalOrderById
    }
})
