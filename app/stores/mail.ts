import { defineStore } from 'pinia'
import type { MailLog } from '~/types/mail'

type OpenedFilter = 'all' | 'opened' | 'not-opened'

export const useMailStore = defineStore('mail', () => {
    const { findById, removeMailLog } = useBulkEmail()

    // ── State ────────────────────────────────────────────────────────────

    /**
     * 以 campaign id 為 key 的多筆快取。
     * 不同活動的資料各自存放，切換活動不會互相覆蓋。
     */
    const campaignCache = ref<Record<string, MailLog[]>>({})

    /** 目前頁面正在檢視的 campaign id */
    const currentId = ref<string | null>(null)

    const isLoading = ref(false)
    const error = ref<string | null>(null)

    // 篩選條件
    const filterEmail = ref('')
    const filterDateStart = ref('')
    const filterDateEnd = ref('')
    const filterOpened = ref<OpenedFilter>('all')

    /** 開信狀態下拉選項（不可變，直接放 store 供各頁面共用） */
    const openedOptions = ref([
        { label: '全部', value: 'all' as OpenedFilter },
        { label: '已開信', value: 'opened' as OpenedFilter },
        { label: '未開信', value: 'not-opened' as OpenedFilter }
    ])

    // ── Getters ──────────────────────────────────────────────────────────

    /**
     * 目前活動的原始資料。
     * 由 campaignCache[currentId] 推導，不直接持有陣列。
     */
    const rows = computed<MailLog[]>(() => {
        if (!currentId.value) return []
        return campaignCache.value[currentId.value] ?? []
    })

    /** 是否有任何篩選條件啟用 */
    const isFiltered = computed(
        () =>
            filterEmail.value.trim() !== '' ||
            filterDateStart.value !== '' ||
            filterDateEnd.value !== '' ||
            filterOpened.value !== 'all'
    )

    /** 套用所有篩選後的資料 */
    const filteredRows = computed<MailLog[]>(() => {
        return rows.value.filter((row) => {
            // 1. Email 關鍵字篩選（不區分大小寫）
            const emailKeyword = filterEmail.value.trim().toLowerCase()
            if (emailKeyword && !row.email.toLowerCase().includes(emailKeyword)) {
                return false
            }

            // 2. 起始日期篩選（≥ 當天 00:00:00）
            if (filterDateStart.value) {
                const startMs = new Date(filterDateStart.value + 'T00:00:00').getTime()
                if (row.sentAt < startMs) return false
            }

            // 3. 結束日期篩選（≤ 當天 23:59:59）
            if (filterDateEnd.value) {
                const endMs = new Date(filterDateEnd.value + 'T23:59:59').getTime()
                if (row.sentAt > endMs) return false
            }

            // 4. 開信狀態篩選
            if (filterOpened.value === 'opened' && !row.opened) return false
            if (filterOpened.value === 'not-opened' && row.opened) return false

            return true
        })
    })

    /** 目前活動中已開信的總數量（不受篩選條件影響） */
    const openedCount = computed(() => {
        return rows.value.filter((row) => row.opened).length
    })

    // ── Actions ──────────────────────────────────────────────────────────

    /** 清除所有篩選條件 */
    const resetFilters = () => {
        filterEmail.value = ''
        filterDateStart.value = ''
        filterDateEnd.value = ''
        filterOpened.value = 'all'
    }

    /**
     * 載入指定 campaign 的資料（快取優先）。
     * - 若 id 已在 campaignCache 中，直接切換 currentId，不打 API。
     * - 切換到不同活動時，自動清除篩選條件。
     */
    const loadCampaign = async (id: string) => {
        // 切換活動時重設篩選，避免舊條件干擾新活動的顯示
        if (currentId.value !== id) {
            resetFilters()
            currentId.value = id
        }

        // 快取命中：直接使用，無需打 API
        if (campaignCache.value[id]) return

        isLoading.value = true
        error.value = null

        try {
            const response = await findById(id)
            const list = (response?.data ?? []) as MailLog[]
            campaignCache.value[id] = list
        } catch (err: unknown) {
            error.value = getErrorMessage(err, '無法取得活動紀錄')
            campaignCache.value[id] = []
        } finally {
            isLoading.value = false
        }
    }

    /**
     * 刪除單筆紀錄
     */
    const deleteMailLog = async (campaignId: string, emailKey: string, mailId: string) => {
        try {
            await removeMailLog(campaignId, emailKey, mailId)

            // 刪除成功後，直接更新本地快取，不需要重新打 API
            if (campaignCache.value[campaignId]) {
                campaignCache.value[campaignId] = campaignCache.value[campaignId].filter(
                    (log) => log.mailId !== mailId
                )
            }
        } catch (err: unknown) {
            throw new Error(getErrorMessage(err, '刪除紀錄失敗'))
        }
    }

    /**
     * 強制重新載入目前活動（清除快取後重新 fetch）。
     */
    const refresh = async () => {
        const id = currentId.value
        if (!id) return
        // delete campaignCache.value[id]
        await loadCampaign(id)
    }

    /**
     * 清除指定 campaign 的快取（供外部主動失效使用）。
     */
    // const invalidate = (id: string) => {
    //     delete campaignCache.value[id]
    // }

    /** 重設整個 store 狀態（通常在登出時呼叫） */
    const reset = () => {
        campaignCache.value = {}
        currentId.value = null
        isLoading.value = false
        error.value = null
        resetFilters()
    }

    return {
        // state
        currentId,
        isLoading,
        error,
        filterEmail,
        filterDateStart,
        filterDateEnd,
        filterOpened,
        openedOptions,
        // getters
        rows,
        isFiltered,
        filteredRows,
        openedCount,
        // actions
        loadCampaign,
        refresh,
        // invalidate,
        resetFilters,
        reset,
        deleteMailLog
    }
})
