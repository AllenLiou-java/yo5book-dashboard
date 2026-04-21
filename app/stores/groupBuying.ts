import { defineStore } from 'pinia'
import type { GroupBuyingData, FormState } from '~/types/groupBuying'

export const useGroupBuyingStore = defineStore('groupBuying', () => {
    // 狀態 (State)
    const list = ref<GroupBuyingData[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    // 計算屬性 (Getters)
    const totalItems = computed(() => list.value.length)

    // 動作 (Actions)
    const fetchGroupBuying = async () => {
        isLoading.value = true
        error.value = null

        try {
            // 呼叫我們之前建立的 Server API
            const { data, success } = await $fetch<{
                data: GroupBuyingData[]
                success: boolean
            }>('/api/admin/groupBuying/list')

            if (success) {
                if (!data || (Array.isArray(data) && data.length === 0)) return

                // 加上status屬性
                let result: GroupBuyingData[] = data.map((value: GroupBuyingData) => ({
                    ...value,
                    status: hasExpired(value.endDate) ? 'ended' : 'active'
                }))

                // 依據builTime欄位 - 降冪排序
                result = result.sort((a, b) => (b['buildTime'] || 0) - (a['buildTime'] || 0))

                list.value = result
            }
        } catch (err: unknown) {
            error.value = err instanceof Error ? err.message : '無法取得團購資料'
        } finally {
            isLoading.value = false
        }
    }

    const fetchGroupBuyingById = async (gid: string): Promise<GroupBuyingData | undefined> => {
        isLoading.value = true
        error.value = null

        try {
            // 呼叫我們之前建立的 Server API
            const { data, success } = await $fetch<{
                data: GroupBuyingData
                success: boolean
            }>(`/api/admin/groupBuying/${gid}`)

            if (success) {
                if (!data) return
                data.gid = gid
                data.status = hasExpired(data.endDate) ? 'ended' : 'active'

                const idx = list.value.findIndex((item) => item.gid === gid)
                if (idx !== -1) {
                    list.value[idx] = data
                } else {
                    list.value.push(data)
                }
            }
        } catch (err: unknown) {
            error.value = err instanceof Error ? err.message : '無法取得團購資料'
        } finally {
            isLoading.value = false
        }
    }

    const updateGroupBuyingById = async (gid: string, updateData: Record<string, unknown>) => {
        isLoading.value = true
        error.value = null

        try {
            // 呼叫我們之前建立的 Server API
            const { success } = await $fetch<{
                data: string
                success: boolean
            }>(`/api/admin/groupBuying/${gid}`, {
                method: 'POST',
                body: updateData
            })

            if (success) {
                // 將資料更新至state
                const idx = list.value.findIndex((item) => item.gid === gid)
                if (idx !== -1) {
                    if (!list.value[idx]) return
                    list.value[idx] = {
                        ...list.value[idx],
                        ...updateData
                    }
                }
            }
        } catch (err: unknown) {
            error.value = err instanceof Error ? err.message : '更新失敗'
        } finally {
            isLoading.value = false
        }
    }

    const removeGroupBuyingItem = async (gid: string) => {
        isLoading.value = true
        error.value = null

        try {
            list.value = list.value.filter((item) => item.gid !== gid)
            await $fetch('/api/admin/groupBuying/remove', {
                method: 'POST',
                body: { groupId: gid }
            })
        } catch (err: unknown) {
            error.value = err instanceof Error ? err.message : '刪除失敗'
        } finally {
            isLoading.value = false
        }
    }

    const addGroupBuyingItem = async (formState: FormState) => {
        isLoading.value = true
        error.value = null

        try {
            await $fetch('/api/admin/groupBuying/add', {
                method: 'POST',
                body: formState
            })
        } catch (err: unknown) {
            error.value = err instanceof Error ? err.message : '新增失敗'
        } finally {
            isLoading.value = false
        }
    }

    return {
        list,
        isLoading,
        error,
        totalItems,
        fetchGroupBuying,
        fetchGroupBuyingById,
        updateGroupBuyingById,
        removeGroupBuyingItem,
        addGroupBuyingItem
    }
})
