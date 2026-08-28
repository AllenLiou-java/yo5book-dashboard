<template>
    <UContainer :ui="{ base: 'max-w-full' }">
        <UCard>
            <template #header>
                <div class="flex flex-row flex-wrap justify-between gap-4">
                    <div>
                        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            團體訂單列表
                        </h1>
                        <div class="mt-2 mb-4">
                            <p class="text-sm text-slate-500">
                                <span class="text-slate-800">團購單位：</span>{{ unitName || '-' }}
                            </p>
                            <p class="text-sm text-slate-500">
                                <span class="text-slate-800"> 截止日期： </span>{{ endDate || '-' }}
                            </p>
                        </div>
                        <p class="text-sm text-slate-500">共 {{ filteredOrders.length }} 筆訂單</p>
                    </div>

                    <div class="flex flex-row flex-wrap items-end gap-4 sm:flex-col sm:flex-nowrap">
                        <UButton
                            :to="{ path: '/admin/orders/group', query: { page } }"
                            label="返回團購列表"
                            variant="outline"
                            color="primary"
                            icon="lucide:arrow-left-from-line"
                            class=""
                        />
                        <div class="flex justify-end gap-4">
                            <UButton
                                color="primary"
                                variant="outline"
                                icon="i-lucide-download"
                                label="匯出"
                                @click="handleExport"
                            >
                            </UButton>
                            <UButton
                                to="/admin/orders/personal/create"
                                color="primary"
                                icon="i-lucide-plus"
                                label="新增訂單"
                            >
                            </UButton>
                        </div>
                    </div>
                </div>
            </template>

            <div
                class="bg-board mb-5 flex flex-col gap-4 p-4 sm:w-auto sm:grid-cols-2 lg:grid-cols-4"
            >
                <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-funnel" class="text-primary size-5" />
                    <span class="font-bold">篩選條件</span>
                </div>

                <!-- 多條件列表 -->
                <div class="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
                    <div
                        v-for="condition in searchConditions"
                        :key="condition.id"
                        class="flex flex-col gap-2 sm:flex-row sm:items-center"
                    >
                        <!-- 篩選項目 -->
                        <USelect
                            v-model="condition.field"
                            :items="getAvailableSearchOptions(condition.id)"
                            class="sm:w-50"
                            @change="onFieldChange(condition)"
                        />

                        <div class="flex w-full gap-1">
                            <!-- 顯示輸入框 or 列表 -->
                            <div class="w-full sm:grow">
                                <template v-if="condition.field === 'status'">
                                    <USelect
                                        v-model="condition.keyword"
                                        :items="statusOptions"
                                        multiple
                                        class="w-full"
                                    />
                                </template>

                                <template v-else>
                                    <UInput
                                        v-model="condition.keyword as string"
                                        icon="i-lucide-search"
                                        placeholder="輸入關鍵字..."
                                        class="w-full"
                                    >
                                        <template v-if="String(condition.keyword).length" #trailing>
                                            <UButton
                                                color="neutral"
                                                variant="link"
                                                size="sm"
                                                icon="i-lucide-circle-x"
                                                aria-label="清除關鍵字"
                                                @click="condition.keyword = ''"
                                            />
                                        </template>
                                    </UInput>
                                </template>
                            </div>

                            <!-- 刪除按鈕 -->
                            <CommonTooltip text="移除條件">
                                <UButton
                                    color="error"
                                    variant="ghost"
                                    icon="i-lucide-trash-2"
                                    aria-label="移除條件"
                                    :disabled="searchConditions.length === 1"
                                    @click="removeSearchCondition(condition.id)"
                            /></CommonTooltip>
                        </div>
                    </div>
                </div>

                <USeparator />

                <div class="flex flex-col justify-between gap-4 sm:flex-row">
                    <div class="flex gap-4">
                        <UButton
                            variant="outline"
                            color="info"
                            icon="i-lucide-plus"
                            label="新增條件"
                            :disabled="searchConditions.length >= searchOptions.length"
                            @click="addSearchCondition"
                        >
                        </UButton>

                        <UButton
                            variant="outline"
                            color="secondary"
                            icon="i-lucide-rotate-ccw"
                            label="清除篩選"
                            @click="resetSearchConditions"
                        >
                        </UButton>
                    </div>

                    <!-- 條件操作 -->
                    <div class="flex items-center gap-2">
                        <span class="shrink-0 text-sm text-slate-500"> 篩選方式 </span>

                        <USelect v-model="searchMode" :items="searchModeOptions" class="grow" />
                    </div>
                </div>
            </div>

            <div ref="tableContainer" class="table-container">
                <UTable
                    v-model:expanded="expanded"
                    v-model:row-selection="rowSelection"
                    :data="paginatedOrders"
                    :columns="columns"
                    :ui="{
                        th: 'table-th',
                        tr: 'table-tr'
                    }"
                    class="flex-1"
                >
                    <template #status-cell="{ row }">
                        <div
                            v-if="editingRowId === row.id"
                            class="editing-active flex items-center justify-center"
                        >
                            <USelect v-model="editingStatus" :items="statusOptions" class="w-48" />
                        </div>
                        <div v-else class="flex items-center gap-2">
                            <span class="w-48">{{
                                statusNameMap[String(row.original.status || '')] ||
                                String(row.original.status || '') ||
                                '無'
                            }}</span>
                        </div>
                    </template>
                    <template #bankAccountNo-cell="{ row }">
                        <div
                            v-if="editingRowId === row.id"
                            class="editing-active flex items-center justify-center"
                        >
                            <UInput
                                v-model="editingBankAccountNo"
                                placeholder="帳號後五碼"
                                class="w-19"
                            />
                        </div>
                        <div v-else class="flex items-center gap-2">
                            <span class="w-19">{{ row.original.bankAccountNo || '-' }}</span>
                        </div>
                    </template>
                    <template #remark-cell="{ row }">
                        <div
                            v-if="editingRowId === row.id"
                            class="editing-active flex items-center justify-center"
                        >
                            <UInput v-model="editingRemark" placeholder="備註" class="w-48" />
                        </div>
                        <CommonTooltip
                            v-else-if="row.original.remark"
                            :text="row.original.remark"
                            :ui="{ popper: { strategy: 'absolute' } }"
                            ><span class="truncate">{{
                                (row.original.remark || '').substring(0, 15) +
                                ((row.original.remark || '').length > 15 ? '...' : '')
                            }}</span></CommonTooltip
                        >
                        <span v-else>-</span>
                    </template>
                    <template #orderDate-cell="{ row }">
                        <ClientOnly>
                            {{ formatDateTime(row.original.orderDate) }}
                            <template #fallback>
                                {{ row.original.orderDate ? '...' : '-' }}
                            </template>
                        </ClientOnly>
                    </template>
                    <template #quick-edit-cell="{ row }">
                        <div
                            v-if="editingRowId === row.id"
                            class="editing-active flex items-center justify-center gap-2"
                        >
                            <CommonTooltip text="儲存"
                                ><div class="inline-block">
                                    <UButton
                                        color="secondary"
                                        size="sm"
                                        icon="i-lucide-save"
                                        @click="handleSaveAll(row)"
                                    /></div
                            ></CommonTooltip>
                            <CommonTooltip text="取消"
                                ><div class="inline-block">
                                    <UButton
                                        color="secondary"
                                        variant="outline"
                                        size="sm"
                                        icon="lucide:save-off"
                                        @click="editingRowId = null"
                                    /></div
                            ></CommonTooltip>
                        </div>
                        <div v-else>
                            <UButton
                                color="secondary"
                                size="sm"
                                icon="i-lucide-edit"
                                aria-label="快速編輯"
                                @click="startEditing(row)"
                            />
                        </div>
                    </template>
                    <template #expanded="{ row }">
                        <div
                            class="expanded-content-wrapper bg-slate-50 p-4 dark:bg-slate-800/50"
                            :class="{ 'editing-expanded-active': editingRowId === row.id }"
                        >
                            <div class="flex flex-col gap-6">
                                <!-- 訂單列表 -->
                                <div>
                                    <h3 class="mb-3 font-bold text-slate-900 dark:text-slate-100">
                                        # 訂單列表
                                    </h3>

                                    <UTable
                                        :data="
                                            row.original.orderList
                                                ? Object.values(row.original.orderList)
                                                : []
                                        "
                                        :columns="orderListColumns"
                                        :ui="{
                                            base: 'min-w-0 table-auto',
                                            th: 'bg-slate-100 dark:bg-slate-800'
                                        }"
                                        class="w-max rounded-md border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                                    >
                                        <template #totalPrice-cell="{ row: totalPriceRow }">
                                            {{
                                                thousandthsFormat(totalPriceRow.original.totalPrice)
                                            }}
                                        </template>
                                        <template #totalPrice-footer>
                                            {{ thousandthsFormat(row.original.totalPrice) }}
                                        </template>
                                    </UTable>
                                </div>

                                <div class="flex gap-6">
                                    <!-- 發票資訊 -->
                                    <div>
                                        <h3
                                            class="mb-3 font-bold text-slate-900 dark:text-slate-100"
                                        >
                                            # 發票資訊
                                        </h3>
                                        <UTable
                                            :data="[
                                                {
                                                    buyer: row.original.buyer
                                                        ? row.original.buyer
                                                        : '–',
                                                    taxId: row.original.taxId
                                                        ? row.original.taxId
                                                        : '–'
                                                }
                                            ]"
                                            :columns="invoiceColumns"
                                            :ui="{
                                                base: 'min-w-0 table-auto',
                                                tr: 'text-center',
                                                th: 'bg-slate-100 text-center dark:bg-slate-800'
                                            }"
                                            class="w-max overflow-hidden rounded-md border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                                        />
                                    </div>

                                    <!-- 配送資訊 -->
                                    <div>
                                        <h3
                                            class="mb-3 font-bold text-slate-900 dark:text-slate-100"
                                        >
                                            # 配送資訊
                                        </h3>
                                        <UTable
                                            :data="[
                                                {
                                                    company: row.original.delivery?.company || '–',
                                                    trackingNo:
                                                        row.original.delivery?.trackingNo || '–',
                                                    trackingUrl:
                                                        row.original.delivery?.trackingUrl || '–'
                                                }
                                            ]"
                                            :columns="deliveryColumns"
                                            :ui="{
                                                base: 'min-w-0 table-auto',
                                                tr: 'text-center',
                                                th: 'bg-slate-100 text-center dark:bg-slate-800'
                                            }"
                                            class="w-max overflow-hidden rounded-md border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                                        >
                                            <template #trackingUrl-cell="{ row: deliveryRow }">
                                                <a
                                                    v-if="deliveryRow.original.trackingUrl !== '–'"
                                                    :href="deliveryRow.original.trackingUrl"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    class="hover:underline"
                                                >
                                                    {{ deliveryRow.original.trackingUrl }}
                                                </a>
                                                <span v-else>–</span>
                                            </template>
                                        </UTable>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </UTable>
            </div>

            <template #footer>
                <div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <div class="flex items-center gap-4">
                        <p class="text-sm text-slate-500">
                            顯示第
                            <span class="font-semibold">{{
                                filteredOrders.length ? (page - 1) * Number(pageCount) + 1 : 0
                            }}</span>
                            到
                            <span class="font-semibold">{{
                                Math.min(page * Number(pageCount), filteredOrders.length)
                            }}</span>
                            筆結果
                        </p>
                        <div class="flex items-center gap-2">
                            <USelect
                                v-model.number="pageCount"
                                :items="pageCountOptions"
                                :options="pageCountOptions"
                                class="w-20"
                                :content="{
                                    side: 'top'
                                }"
                            />
                            <span class="text-sm text-slate-500">筆 / 頁</span>
                        </div>
                    </div>
                    <UPagination
                        v-model:page="page"
                        :total="filteredOrders.length"
                        :items-per-page="Number(pageCount)"
                    />
                </div>
            </template>
        </UCard>
    </UContainer>
</template>

<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { OrderData } from '~/types/order'

const route = useRoute()
const router = useRouter()

const unitName = computed(() => route.query.unitName as string)
const endDate = computed(() => route.query.endDate as string)

const groupId = computed(() => route.params.groupId as string)

const orderStore = useOrderStore()
const { groupOrderList, error, statusOptions } = storeToRefs(orderStore)
const { updateGroupOrder } = orderStore

if (groupId.value) {
    await orderStore.getGroupOrderById(groupId.value)
}

const UButton = resolveComponent('UButton')
const UCheckbox = resolveComponent('UCheckbox')
const USelect = resolveComponent('USelect')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const toastStore = useToastStore()

const expanded = ref({})
const rowSelection = ref<Record<string, boolean>>({})

// 訂單狀態編輯狀態與選項
const editingRowId = ref<string | null>(null)
const editingStatus = ref<string>('')
const editingBankAccountNo = ref<string>('')
const editingRemark = ref<string>('')

const statusNameMap = computed(() => {
    return statusOptions.value.reduce(
        (acc, option) => {
            acc[String(option.value)] = option.label
            return acc
        },
        {} as Record<string, string>
    )
})

function startEditing(row: { id: string; original: OrderData }) {
    editingRowId.value = row.id
    editingStatus.value = String(row.original.status || '') || '1'
    editingBankAccountNo.value = row.original.bankAccountNo || ''
    editingRemark.value = row.original.remark || ''
}

async function handleSaveAll(row: { id: string; original: OrderData }) {
    const { orderId, groupId } = row.original
    const updatedData: Partial<OrderData> = {}

    const newStatus = editingStatus.value
    const newBankAccountNo = editingBankAccountNo.value.trim()
    const newRemark = editingRemark.value.trim()

    if (newStatus !== (row.original.status || '')) {
        updatedData.status = newStatus
    }
    if (newBankAccountNo !== (row.original.bankAccountNo || '')) {
        updatedData.bankAccountNo = newBankAccountNo
    }
    if (newRemark !== (row.original.remark || '')) {
        updatedData.remark = newRemark
    }

    if (Object.keys(updatedData).length === 0) {
        editingRowId.value = null // 關閉編輯模式
        return
    }

    if (orderId && groupId) {
        await updateGroupOrder(groupId, orderId, updatedData)
        if (error.value) {
            editingRowId.value = null // 關閉編輯模式
            toastStore.error('更新失敗', error.value)
            return
        }

        Object.assign(row.original, updatedData)
        editingRowId.value = null // 關閉編輯模式
        toastStore.success('更新成功')
    }
}

// === 針對Table編輯模式，使用 inert 屬性以取代 pointer-events，確保鍵盤與滑鼠皆無法互動 ===
const tableContainer = ref<HTMLElement | null>(null)

watchPostEffect(() => {
    if (!tableContainer.value) return

    // 使用 requestAnimationFrame 確保 UTable 已完成展開列的 DOM 渲染
    requestAnimationFrame(() => {
        const tbody = tableContainer.value?.querySelector('tbody')
        if (!tbody) return

        // 使用 :scope > tr 確保只選取外層的主列，不影響嵌套的訂單子表格
        const trs = tbody.querySelectorAll(':scope > tr')
        const hasEditing = tbody.querySelector('.editing-active') !== null
        const hasExpanded = tbody.querySelector('tr[data-expanded="true"]') !== null

        const shouldDimOthers = hasEditing || hasExpanded

        trs.forEach((tr) => {
            const isFocusRow =
                tr.querySelector('.editing-active') !== null ||
                tr.querySelector('.editing-expanded-active') !== null ||
                tr.getAttribute('data-expanded') === 'true' ||
                tr.querySelector('.expanded-content-wrapper') !== null

            // 若有正在處理的列，且當前列不是焦點列，則加上 inert 屬性
            if (shouldDimOthers && !isFocusRow) {
                tr.setAttribute('inert', '')
            } else {
                tr.removeAttribute('inert')
            }
        })
    })
})

// ==========================================
// 多條件搜尋
// ==========================================

type SearchField = 'orderId' | 'address' | 'name' | 'phone' | 'email' | 'bankAccountNo' | 'status'

type SearchMode = 'all' | 'any'

interface SearchCondition {
    id: number
    field: SearchField
    keyword: string | string[]
}

const searchOptions: Array<{
    label: string
    value: SearchField
}> = [
    { label: '訂單號碼', value: 'orderId' },
    { label: '收件地址', value: 'address' },
    { label: '收件人', value: 'name' },
    { label: '聯絡電話', value: 'phone' },
    { label: '電子信箱', value: 'email' },
    { label: '帳號後五碼', value: 'bankAccountNo' },
    { label: '訂單狀態', value: 'status' }
]

const searchModeOptions: Array<{
    label: string
    value: SearchMode
}> = [
    { label: '符合全部條件', value: 'all' },
    { label: '符合任一條件', value: 'any' }
]

const searchMode = ref<SearchMode>('all')

let searchConditionId = 0

function createSearchCondition(field?: SearchField): SearchCondition {
    searchConditionId += 1

    if (!field) {
        const usedFields = searchConditions.value.map((c) => c.field)
        const availableOption = searchOptions.find((opt) => !usedFields.includes(opt.value))
        field = availableOption ? availableOption.value : 'orderId'
    }

    const keyword = field === 'status' ? [] : ''

    return {
        id: searchConditionId,
        field,
        keyword
    }
}

const searchConditions = ref<SearchCondition[]>([createSearchCondition('orderId')])

function getAvailableSearchOptions(currentId: number) {
    const usedFields = searchConditions.value.filter((c) => c.id !== currentId).map((c) => c.field)

    return searchOptions.filter((option) => !usedFields.includes(option.value))
}

watch(
    searchConditions,
    (conditions) => {
        conditions.forEach((condition) => {
            if (condition.field === 'status' && !Array.isArray(condition.keyword)) {
                condition.keyword = []
            }
        })
    },
    { deep: true }
)

function addSearchCondition() {
    searchConditions.value.push(createSearchCondition())
}

function onFieldChange(condition: SearchCondition) {
    if (condition.field === 'status') {
        condition.keyword = []
    } else {
        condition.keyword = ''
    }
}

function removeSearchCondition(id: number) {
    if (searchConditions.value.length <= 1) return

    searchConditions.value = searchConditions.value.filter((condition) => condition.id !== id)
}

function resetSearchConditions() {
    searchMode.value = 'all'
    searchConditions.value = [createSearchCondition('orderId')]
}

// 分頁設定
const pageCount = ref(99999)
const pageCountOptions = [
    { label: '10', value: 10 },
    { label: '20', value: 20 },
    { label: '40', value: 40 },
    { label: '100', value: 100 },
    { label: '全部', value: 99999 }
]

// 使用 computed 雙向綁定 URL Query 與分頁狀態
const page = computed({
    get: () => Number(route.query.page) || 1,
    set: (val) => router.replace({ query: { ...route.query, page: val } })
})

const searchFieldGetters = {
    orderId: (order: OrderData) => order.orderId,
    address: (order: OrderData) => order.receiver?.address,
    name: (order: OrderData) => order.receiver?.name,
    phone: (order: OrderData) => order.phone,
    email: (order: OrderData) => order.email,
    bankAccountNo: (order: OrderData) => order.bankAccountNo,
    status: (order: OrderData) => order.status
} satisfies Record<SearchField, (order: OrderData) => unknown>

function normalizeSearchValue(value: unknown) {
    return String(value ?? '')
        .trim()
        .toLocaleLowerCase()
}

function orderMatchesCondition(order: OrderData, condition: SearchCondition) {
    const targetValue = searchFieldGetters[condition.field](order)

    if (condition.field === 'status' && Array.isArray(condition.keyword)) {
        // 如果關鍵字陣列是空的，代表不篩選，直接返回 true
        if (condition.keyword.length === 0) {
            return true
        }
        return condition.keyword.includes(String(targetValue))
    } else {
        const keyword = normalizeSearchValue(condition.keyword)
        const normalizedTarget = normalizeSearchValue(targetValue)
        return normalizedTarget.includes(keyword)
    }
}

const filteredOrders = computed(() => {
    const groupOrder = groupOrderList.value?.[groupId.value] || []

    // 忽略尚未輸入關鍵字的空白條件
    const activeConditions = searchConditions.value.filter((condition) => {
        if (Array.isArray(condition.keyword)) {
            return condition.keyword.length > 0
        }
        return String(condition.keyword).trim().length > 0
    })

    // 沒有有效條件時顯示全部訂單
    if (activeConditions.length === 0) {
        return groupOrder
    }

    return groupOrder.filter((order) => {
        if (searchMode.value === 'all') {
            // AND：每一個條件都必須符合
            return activeConditions.every((condition) => orderMatchesCondition(order, condition))
        }

        // OR：只要其中一個條件符合
        return activeConditions.some((condition) => orderMatchesCondition(order, condition))
    })
})

watch(
    [searchConditions, searchMode, pageCount],
    () => {
        page.value = 1
        rowSelection.value = {}
    },
    {
        deep: true
    }
)

// 切換分頁時，自動取消編輯狀態
watch(page, () => {
    editingRowId.value = null
    rowSelection.value = {}
})

function handleExport() {
    const selectedIndices = Object.keys(rowSelection.value).filter((key) => rowSelection.value[key])

    if (selectedIndices.length === 0) {
        toastStore.error('請先勾選要匯出的訂單')
        return
    }

    const selectedData = selectedIndices
        .map((index) => paginatedOrders.value[Number(index)])
        .filter((order): order is OrderData => order !== undefined)

    exportOrdersExcel(selectedData)

    toastStore.success(`已選擇 ${selectedData.length} 筆訂單進行匯出`)
}

const paginatedOrders = computed(() => {
    const limit = Number(pageCount.value)
    const start = (page.value - 1) * limit
    const end = start + limit
    return filteredOrders.value.slice(start, end)
})

const columns: TableColumn<OrderData>[] = [
    {
        id: 'select',
        header: ({ table }) =>
            h(UCheckbox, {
                modelValue: table.getIsSomePageRowsSelected()
                    ? 'indeterminate'
                    : table.getIsAllPageRowsSelected(),
                'onUpdate:modelValue': (value: boolean | null) =>
                    table.toggleAllPageRowsSelected(!!value),
                ariaLabel: 'Select all'
            }),
        cell: ({ row }) =>
            h(UCheckbox, {
                modelValue: row.getIsSelected(),
                'onUpdate:modelValue': (value: boolean | null) => row.toggleSelected(!!value),
                ariaLabel: 'Select row'
            })
    },
    {
        id: 'expand',
        cell: ({ row }) =>
            h(UButton, {
                color: 'neutral',
                variant: 'ghost',
                icon: 'i-lucide-chevron-down',
                square: true,
                'aria-label': 'Expand',
                ui: {
                    leadingIcon: [
                        'transition-transform',
                        row.getIsExpanded() ? 'duration-200 rotate-180' : ''
                    ]
                },
                onClick: () => row.toggleExpanded()
            })
    },
    {
        id: 'index',
        header: '編號',
        cell: ({ row }) => `#${(page.value - 1) * pageCount.value + row.index + 1}`
    },
    {
        accessorKey: 'orderDate',
        header: '訂單日期',
        meta: { class: { th: 'text-center w-38', td: 'text-center' } }
    },
    {
        accessorKey: 'orderId',
        header: '訂單號碼',
        meta: { class: { th: 'text-center w-39', td: 'text-center' } }
    },
    {
        accessorKey: 'receiver.address',
        header: '收件地址',
        cell: ({ row }) => row.original.receiver?.address || '-'
    },
    {
        accessorKey: 'receiver.name',
        header: '收件人',
        cell: ({ row }) => row.original.receiver?.name || '-'
    },
    {
        accessorKey: 'phone',
        header: '聯絡電話',
        cell: ({ row }) => row.original.phone || '-'
    },
    {
        accessorKey: 'email',
        header: '電子信箱',
        cell: ({ row }) => row.original.email || '-'
    },
    {
        accessorKey: 'status',
        header: '訂單狀態',
        meta: { class: { th: 'text-center', td: 'text-center' } }
    },
    {
        accessorKey: 'bankAccountNo',
        header: '帳號後五碼',
        meta: { class: { th: 'text-center', td: 'text-center' } }
    },
    {
        accessorKey: 'remark',
        header: '備註',
        meta: { class: { th: 'text-center', td: 'text-center' } }
    },
    {
        id: 'quick-edit',
        header: '快速編輯',
        meta: { class: { th: 'text-center', td: 'text-center' } }
    },
    {
        id: 'actions',
        header: '操作',
        meta: {
            class: {
                td: 'text-right'
            }
        },
        cell: ({ row }) => {
            return h(
                UDropdownMenu,
                {
                    modal: false,
                    content: {
                        align: 'end',
                        onCloseAutoFocus: (e: Event) => e.preventDefault()
                    },
                    items: getRowItems(row),
                    'aria-label': '操作選項'
                },
                () =>
                    h(UButton, {
                        icon: 'i-lucide-ellipsis-vertical',
                        color: 'neutral',
                        variant: 'ghost',
                        'aria-label': '操作選項'
                    })
            )
        }
    }
]

function getRowItems(row: { id: string; original: OrderData }) {
    return [
        {
            label: '編輯',
            icon: 'i-lucide-edit',
            async onSelect() {
                const { groupId, orderId } = row.original

                await navigateTo({
                    path: `/admin/orders/group/${groupId}/${orderId}`,
                    query: {
                        ...route.query,
                        action: 'edit'
                    }
                })
            }
        },
        {
            label: '詳情',
            icon: 'i-lucide-file-text',
            async onSelect() {
                const { groupId, orderId } = row.original

                await navigateTo({
                    path: `/admin/orders/group/${groupId}/${orderId}`,
                    query: {
                        ...route.query,
                        action: 'view'
                    }
                })
            }
        }
    ]
}

const orderListColumns = [
    {
        accessorKey: 'productName',
        header: '產品名稱',
        footer: '合計'
    },
    { accessorKey: 'qty', header: '數量' },
    {
        accessorKey: 'totalPrice',
        header: '總金額'
    }
]

const invoiceColumns = [
    { accessorKey: 'buyer', header: '發票買受人' },
    { accessorKey: 'taxId', header: '統一編號' }
]

const deliveryColumns = [
    { accessorKey: 'company', header: '貨運公司' },
    { accessorKey: 'trackingNo', header: '追蹤碼' },
    { accessorKey: 'trackingUrl', header: '追蹤連結' }
]
</script>

<style scoped>
/* 當有處於編輯狀態或展開的列時，將表格內其他列加上遮罩效果並停用點擊 */
:deep(tbody:has(.editing-active) > tr),
:deep(tbody:has(tr[data-expanded='true']) > tr) {
    opacity: 0.3;
    transition: all 0.3s ease;
}

/* 確保正在編輯、展開的列及其展開內容保持正常顯示且可互動 */
:deep(tbody > tr:has(.editing-active)),
:deep(tbody > tr:has(.editing-expanded-active)),
:deep(tbody > tr[data-expanded='true']),
:deep(tbody > tr:has(.expanded-content-wrapper)) {
    opacity: 1 !important;
}

/* 確保正在編輯的列及其展開內容保持高亮背景色 */
:deep(tbody > tr:has(.editing-active)),
:deep(tbody > tr:has(.editing-expanded-active)) {
    background-color: rgb(248 250 252); /* slate-50 */
}

:deep(.dark tbody > tr:has(.editing-active)),
:deep(.dark tbody > tr:has(.editing-expanded-active)) {
    background-color: rgb(30 41 59 / 0.5); /* slate-800/50 */
}
</style>
