import { defineStore } from 'pinia'
import type { OrderData } from '~/types/order'

export const useOrderStore = defineStore('order', () => {
    const personalOrderList = ref<OrderData[]>([])
    const groupOrderList = ref<Record<string, OrderData[]>>({})
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
    const groupOrder = useGroupOrder()

    const getPersonalOrders = async () => {
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

    const createPersonalOrder = async (orderData: Partial<OrderData>) => {
        isLoading.value = true
        error.value = null
        // 使用 as OrderData 斷言，符合 personalOrder.create 要求的參數型別
        const submitData = { ...orderData } as OrderData

        try {
            const orderId = orderIdCreater()
            submitData.orderId = orderId
            submitData.orderDate = Date.now()
            submitData.isClosed = false
            const adminUser = useCookie<{ id: string | undefined; email: string } | null>(
                'admin_user'
            )
            if (adminUser) {
                submitData.userId = adminUser.value?.id || ''
                submitData.remark = '管理員新增訂單'
            }

            const { data, success } = await personalOrder.create(submitData)

            // 確保成功且 data 確實存在才放入列表
            if (success && data) {
                personalOrderList.value.unshift(submitData)
            }
        } catch (err: unknown) {
            error.value = getErrorMessage(err, '新增失敗')
        } finally {
            isLoading.value = false
        }
    }

    const getGroupOrderById = async (groupId: string) => {
        isLoading.value = true
        error.value = null

        try {
            const { data, success } = await groupOrder.findByGroupId(groupId)

            if (success) {
                groupOrderList.value[groupId] = data
            }
        } catch (err: unknown) {
            error.value = getErrorMessage(err, '無法取得訂單資料列表')
        } finally {
            isLoading.value = false
        }
    }

    const getGroupOrderDetailById = async (groupId: string, orderId: string) => {
        isLoading.value = true
        error.value = null

        try {
            const { data, success } = await groupOrder.findByOrderId(groupId, orderId)

            if (success) {
                return data
            }
        } catch (err: unknown) {
            error.value = getErrorMessage(err, '無法取得訂單資料列表')
        } finally {
            isLoading.value = false
        }
    }

    /**
     * 通用的更新團體訂單單一欄位的方法
     * @param groupId - 團購 ID
     * @param orderId - 訂單 ID
     * @param updatedData - 一個包含要更新的鍵值對的物件，例如 { status: '2' } 或 { bankAccountNo: '12345' }
     */
    const updateGroupOrder = async (
        groupId: string,
        orderId: string,
        updatedData: Partial<OrderData>
    ) => {
        isLoading.value = true
        error.value = null

        try {
            await groupOrder.update(groupId, orderId, updatedData)
            // 將updatedData更新至 groupOrderList中指定對應資料
            const index = groupOrderList.value[groupId]?.findIndex(
                (item) => item.orderId === orderId
            )
            if (index !== undefined && index !== -1 && groupOrderList.value[groupId]?.[index]) {
                const target = groupOrderList.value[groupId]![index]!

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
            error.value = getErrorMessage(err, '更新資料失敗')
        } finally {
            isLoading.value = false
        }
    }

    const createGroupOrder = async (groupId: string, orderData: Partial<OrderData>) => {
        isLoading.value = true
        error.value = null
        // 使用 as OrderData 斷言，符合 personalOrder.create 要求的參數型別
        const submitData = { ...orderData } as OrderData

        try {
            const orderId = orderIdCreater()
            submitData.orderId = orderId
            submitData.orderDate = Date.now()
            submitData.isClosed = false

            const adminUser = useCookie<{ id: string | undefined; email: string } | null>(
                'admin_user'
            )
            if (adminUser) {
                submitData.userId = adminUser.value?.id || ''
                submitData.remark = '管理員新增訂單'
            }

            const { data, success } = await groupOrder.create(groupId, submitData)

            // 確保成功且 data 確實存在才放入列表
            if (success && data) {
                if (!groupOrderList.value[groupId]) {
                    groupOrderList.value[groupId] = []
                } else {
                    submitData.groupId = groupId
                    groupOrderList.value[groupId].unshift(submitData)
                }
            }
        } catch (err: unknown) {
            error.value = getErrorMessage(err, '新增失敗')
        } finally {
            isLoading.value = false
        }
    }

    /**
     * 重設 store 狀態
     */
    const reset = () => {
        personalOrderList.value = []
        groupOrderList.value = {}
        isLoading.value = false
        error.value = null
    }

    return {
        personalOrderList,
        groupOrderList,
        isLoading,
        error,
        statusOptions,
        getPersonalOrders,
        updatePersonalOrder,
        updatePersonalOrderStatus,
        getPersonalOrderById,
        createPersonalOrder,
        getGroupOrderById,
        getGroupOrderDetailById,
        updateGroupOrder,
        createGroupOrder,
        reset
    }
})
