<template>
    <div class="summary-board-container">
        <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
                <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">團購活動列表</h1>

                <p class="text-sm text-slate-500">管理與監控所有進行中及歷史團購活動。</p>
            </div>
            <NuxtLink
                to="/admin/groupBuying/create"
                class="bg-primary hover:bg-primary/90 shadow-primary/20 flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all"
            >
                <span class="material-symbols-outlined text-lg">add_circle</span>
                新增團購活動
            </NuxtLink>
        </div>

        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div
                class="flex w-fit gap-1 rounded-xl border border-slate-200 bg-white p-1.5 dark:border-slate-800 dark:bg-slate-900"
            >
                <button
                    v-for="tab in tabs"
                    :key="tab.value"
                    :class="[
                        'rounded-lg px-6 py-2 text-sm font-semibold transition-colors',
                        currentTab === tab.value
                            ? 'bg-primary text-white'
                            : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                    ]"
                    @click="currentTab = tab.value"
                >
                    {{ tab.label }}
                </button>
            </div>

            <div class="w-full sm:w-72">
                <UInput
                    v-model="searchUnitName"
                    icon="i-lucide-search"
                    placeholder="搜尋團購單位..."
                >
                    <template #trailing>
                        <UButton
                            color="neutral"
                            variant="ghost"
                            size="sm"
                            icon="i-lucide-x"
                            aria-label="Clear input"
                            @click="searchUnitName = ''"
                        />
                    </template>
                </UInput>
            </div>
        </div>

        <div
            class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
            <UTable
                :data="paginatedActivities"
                :columns="tableColumns"
                :ui="{
                    base: 'min-w-full table-auto',
                    th: 'text-white bg-primary dark:bg-blue-900',
                    tr: 'data-[expanded=true]:bg-elevated/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors'
                }"
            >
                <template #gid-cell="{ row }">
                    <div class="flex items-center justify-center gap-2">
                        <span class="font-mono text-sm text-slate-600 dark:text-slate-400">
                            {{ row.original.gid }}
                        </span>
                        <CommonTooltip text="複製代號">
                            <UButton
                                icon="i-lucide-copy"
                                size="xs"
                                variant="ghost"
                                @click="copyGid(row.original.gid)"
                            />
                        </CommonTooltip>
                    </div>
                </template>

                <template #unit-cell="{ row }">
                    <div class="flex items-center gap-3">
                        <span class="font-medium text-slate-700 dark:text-slate-200">
                            {{ row.original.unitName }}
                        </span>
                        <CommonTooltip text="複製團購單位">
                            <UButton
                                icon="i-lucide-copy"
                                size="xs"
                                variant="ghost"
                                @click="copyGid(row.original.unitName)"
                            />
                        </CommonTooltip>
                    </div>
                </template>

                <template #title-cell="{ row }">
                    <span class="text-slate-600 dark:text-slate-400">{{ row.original.title }}</span>
                </template>
                <template #buildTime-cell="{ row }">
                    <span
                        v-if="row.original.buildTime"
                        :class="['rounded-full bg-gray-100 px-3 py-1 text-xs font-medium']"
                    >
                        {{ formatDate(row.original.buildTime) }}
                    </span>
                </template>

                <template #endDate-cell="{ row }">
                    <span
                        :class="[
                            'rounded-full px-3 py-1 text-xs font-medium',
                            getStatusBadgeClass(row.original.status)
                        ]"
                    >
                        {{ row.original.endDate }}
                    </span>
                </template>

                <template #actions-cell="{ row }">
                    <div class="flex justify-center gap-2">
                        <CommonTooltip text="詳細資料">
                            <UButton
                                :to="`/admin/groupBuying/${row.original.gid}?action=view&page=${page}`"
                                icon="i-lucide-view"
                                size="xl"
                                variant="ghost"
                            ></UButton>
                        </CommonTooltip>

                        <CommonTooltip text="編輯">
                            <UButton
                                :to="`/admin/groupBuying/${row.original.gid}?action=edit&page=${page}`"
                                icon="i-lucide-file-edit"
                                size="xl"
                                variant="ghost"
                            ></UButton>
                        </CommonTooltip>

                        <CommonTooltip text="刪除">
                            <UButton
                                class="text-red-500 transition-colors hover:bg-red-50"
                                icon="i-lucide-trash-2"
                                size="xl"
                                variant="ghost"
                                @click="handleDelete(row.original.gid)"
                            ></UButton>
                        </CommonTooltip>
                    </div>
                </template>
            </UTable>

            <div
                class="flex flex-col items-center justify-between gap-4 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row dark:border-slate-800 dark:bg-slate-800/30"
            >
                <p class="text-sm text-slate-500">
                    顯示第
                    <span class="font-semibold">{{
                        filteredActivities.length ? (page - 1) * pageCount + 1 : 0
                    }}</span>
                    到
                    <span class="font-semibold">{{
                        Math.min(page * pageCount, filteredActivities.length)
                    }}</span>
                    筆結果
                </p>
                <UPagination
                    v-model:page="page"
                    :total="filteredActivities.length"
                    :items-per-page="pageCount"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { LazyModalBasic } from '#components'

const route = useRoute()
const router = useRouter()

// UTable Columns 定義
const tableColumns = [
    {
        accessorKey: 'gid',
        header: '團購單位代號',
        meta: { class: { th: 'text-center', td: 'text-center' } }
    },
    {
        accessorKey: 'unit',
        header: '團購單位'
    },
    {
        accessorKey: 'title',
        header: '活動標題'
    },
    {
        accessorKey: 'buildTime',
        header: '建立日期',
        meta: { class: { th: 'text-center', td: 'text-center' } }
    },
    {
        accessorKey: 'endDate',
        header: '截止日期',
        meta: { class: { th: 'text-center', td: 'text-center' } }
    },
    {
        id: 'actions',
        header: '操作項目',
        meta: { class: { th: 'text-center', td: 'text-center' } }
    }
]

const groupBuyingStore = useGroupBuyingStore()
const { error: groupBuyingError } = storeToRefs(groupBuyingStore)

await callOnce('initGroupBuying', async () => {
    await groupBuyingStore.fetchGroupBuying()
})

const toastStore = useToastStore()
watch(
    () => groupBuyingError.value,
    (errorMsg) => {
        if (import.meta.server) return
        if (errorMsg) {
            toastStore.error('刪除團購活動', errorMsg)
        }
    },
    { immediate: true }
)

// Tabs 資料
const currentTab = ref('all')
const tabs = [
    { label: '所有活動', value: 'all' },
    { label: '進行中', value: 'active' },
    { label: '已結束', value: 'ended' }
]

// 關鍵字搜尋(團購單位)狀態
const searchUnitName = ref('')

// 根據 Tab 篩選資料
const filteredActivities = computed(() => {
    let activities = groupBuyingStore.list.map((item) => ({
        gid: item.gid,
        unitName: item.unitName,
        title: item.title,
        buildTime: item.buildTime,
        endDate: item.endDate,
        status: item.status
    }))

    if (currentTab.value !== 'all') {
        activities = activities.filter((item) => item.status === currentTab.value)
    }

    if (searchUnitName.value.trim()) {
        const keyword = searchUnitName.value.trim().toLowerCase()
        activities = activities.filter((item) => item.unitName?.toLowerCase().includes(keyword))
    }

    return activities
})

// 分頁設定
const pageCount = ref(10)

const page = computed({
    get: () => Number(route.query.page) || 1,
    set: (val) => router.replace({ query: { ...route.query, page: val } })
})

// 監聽 Tab 或搜尋條件切換，將分頁重設回第一頁
watch([currentTab, searchUnitName], () => {
    page.value = 1
})

const paginatedActivities = computed(() => {
    const start = (page.value - 1) * pageCount.value
    const end = start + pageCount.value
    return filteredActivities.value.slice(start, end)
})

const overlay = useOverlay()
const modal = overlay.create(LazyModalBasic)

const handleDelete = async (gid: string | undefined) => {
    const instance = modal.open({
        title: '刪除此活動',
        submitLabel: '確定刪除',
        cancelLabel: '取消'
    })

    const shouldIncrement = await instance.result

    if (shouldIncrement) {
        if (!gid) return

        const { success, message } = (await groupBuyingStore.removeGroupBuyingItem(gid)) as {
            success: boolean
            message: string
        }

        if (success) {
            toastStore.success('刪除團購活動', message)
        } else {
            toastStore.error('刪除團購活動', message)
        }
    }
}

const copyGid = async (gid: string | undefined) => {
    if (!gid) return
    try {
        await navigator.clipboard.writeText(gid)
        toastStore.success('複製成功', '已複製到剪貼簿')
    } catch {
        toastStore.error('複製失敗', '無法複製到剪貼簿')
    }
}
</script>

<style scoped></style>
