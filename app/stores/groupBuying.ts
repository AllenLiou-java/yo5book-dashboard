import { defineStore } from 'pinia'
import type { GroupBuyingData, FormState } from '~/types/groupBuying'

export const useGroupBuyingStore = defineStore('groupBuying', () => {
    // 狀態 (State)
    const list = ref<GroupBuyingData[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    const groupBuying = useGroupBuying()

    // 計算屬性 (Getters)
    const totalItems = computed(() => list.value.length)

    // 動作 (Actions)
    const fetchGroupBuying = async () => {
        isLoading.value = true
        error.value = null

        try {
            const { data, success } = await groupBuying.findAll()

            if (success) {
                if (!data || (Array.isArray(data) && data.length === 0)) return

                // 加上status屬性
                list.value = data.map((value: GroupBuyingData) => ({
                    ...value,
                    status: hasExpired(value.endDate) ? 'ended' : 'active'
                }))
            }
        } catch (err: unknown) {
            error.value = getErrorMessage(err, '無法取得團購資料')
        } finally {
            isLoading.value = false
        }
    }

    const fetchGroupBuyingById = async (gid: string): Promise<GroupBuyingData | undefined> => {
        // 1. 先確認 list 中是否已經有這筆資料，若有則直接回傳，不觸發 API 與 Loading
        const existingData = list.value.find((item) => item.gid === gid)
        if (existingData) return existingData

        isLoading.value = true
        error.value = null

        try {
            const { data, success } = (await groupBuying.findByGroupId(gid)) as {
                data: GroupBuyingData
                success: boolean
            }

            if (success) {
                if (!data) return
                data.status = hasExpired(data.endDate) ? 'ended' : 'active'

                // 2. 因為前面已經確認過不在列表中，所以這裡可以直接 push
                list.value.push(data)

                // 3. 回傳新取得的資料，以符合 Promise<GroupBuyingData | undefined> 的型別
                return data
            }
        } catch (err: unknown) {
            error.value = getErrorMessage(err, '無法取得團購資料')
        } finally {
            isLoading.value = false
        }
    }

    const updateGroupBuyingById = async (gid: string, updateData: Record<string, unknown>) => {
        isLoading.value = true
        error.value = null

        try {
            const { success } = await groupBuying.update(gid, updateData)

            if (success) {
                if (updateData.endDate) {
                    updateData.status = hasExpired(updateData.endDate as string)
                        ? 'ended'
                        : 'active'
                }
                // 將資料更新至state
                const item = list.value.find((i) => i.gid === gid)
                if (item) {
                    Object.assign(item, updateData)
                }
            }
        } catch (err: unknown) {
            error.value = getErrorMessage(err, '更新失敗')
        } finally {
            isLoading.value = false
        }
    }

    const addGroupBuyingItem = async (formState: FormState) => {
        isLoading.value = true
        error.value = null

        try {
            const { data, success } = await groupBuying.create(formState)
            if (success) {
                if (data) {
                    list.value.unshift(data)
                }
            }
        } catch (err: unknown) {
            error.value = getErrorMessage(err, '新增失敗')
        } finally {
            isLoading.value = false
        }
    }

    const removeGroupBuyingItem = async (gid: string) => {
        isLoading.value = true
        error.value = null

        try {
            list.value = list.value.filter((item) => item.gid !== gid)
            return await groupBuying.remove(gid)
        } catch (err: unknown) {
            error.value = getErrorMessage(err, '刪除失敗')
        } finally {
            isLoading.value = false
        }
    }

    /**
     * 重設 store 狀態
     */
    const reset = () => {
        list.value = []
        isLoading.value = false
        error.value = null
    }

    return {
        list,
        isLoading,
        error,
        totalItems,
        fetchGroupBuying,
        fetchGroupBuyingById,
        updateGroupBuyingById,
        addGroupBuyingItem,
        removeGroupBuyingItem,
        reset
    }
})
