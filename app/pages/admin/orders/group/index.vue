<template>
    <div class="mx-auto flex max-w-7xl flex-col gap-6">
        <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
                <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">團購訂單列表</h1>
                <p class="text-sm text-slate-500">管理與監控所有團購訂單。</p>
            </div>
        </div>

        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <!-- Tabs 篩選 -->
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

            <!-- 搜尋列 -->
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
                <template #unit-cell="{ row }">
                    <div class="flex items-center gap-3">
                        <span class="font-medium text-slate-700 dark:text-slate-200">
                            {{ row.original.unitName }}
                        </span>
                    </div>
                </template>

                <template #title-cell="{ row }">
                    <span class="text-slate-600 dark:text-slate-400">{{ row.original.title }}</span>
                </template>

                <template #buildTime-cell="{ row }">
                    <span
                        v-if="row.original.buildTime"
                        :class="['rounded-full px-3 py-1 text-xs font-medium']"
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
                    <NuxtLink
                        :to="`/admin/orders/group/${row.original.gid}?page=${page}&unitName=${row.original.unitName}&endDate=${row.original.endDate}`"
                    >
                        <CommonTooltip text="點擊前往">
                            <UButton icon="i-lucide-table-of-contents" variant="ghost"></UButton>
                        </CommonTooltip>
                    </NuxtLink>
                </template>
            </UTable>

            <div
                class="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/30"
            >
                <p class="text-sm text-slate-500">
                    顯示第
                    <span class="font-semibold">{{
                        filteredActivities.length
                            ? pagination.pageIndex * pagination.pageSize + 1
                            : 0
                    }}</span>
                    到
                    <span class="font-semibold">{{
                        Math.min(
                            (pagination.pageIndex + 1) * pagination.pageSize,
                            filteredActivities.length
                        )
                    }}</span>
                    筆結果
                </p>
                <UPagination
                    v-model:page="page"
                    :total="filteredActivities.length"
                    :items-per-page="pagination.pageSize"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'admin'
})

const route = useRoute()
const router = useRouter()

// UTable Columns 定義
const tableColumns = [
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
        accessorKey: 'actions',
        id: 'actions',
        header: '訂單列表',
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
            toastStore.error(String(errorMsg))
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
const initialPage = Number(route.query.page) || 1
const pagination = ref({
    pageIndex: Math.max(0, initialPage - 1), // 根據 URL Query 初始化，從 0 開始
    pageSize: 10 // 預設每頁筆數
})

// 監聽 Tab 或搜尋條件切換，當篩選條件改變時將分頁重設回第一頁
watch([currentTab, searchUnitName], () => {
    pagination.value.pageIndex = 0
})

// 同步分頁狀態到 URL Query
watch(
    () => pagination.value.pageIndex,
    (newIndex) => {
        router.replace({ query: { ...route.query, page: newIndex + 1 } })
    }
)

// 結合 UTable 與 UPagination 的資料，擷取當前分頁的範圍
const paginatedActivities = computed(() => {
    const start = pagination.value.pageIndex * pagination.value.pageSize
    const end = start + pagination.value.pageSize
    return filteredActivities.value.slice(start, end)
})

// 將 UTable 的 pageIndex 綁定到 UPagination 的 page (1 開始)
const page = computed({
    get: () => pagination.value.pageIndex + 1,
    set: (value) => {
        pagination.value.pageIndex = value - 1
    }
})
</script>

<style scoped></style>
