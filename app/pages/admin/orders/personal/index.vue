<template>
    <div class="summary-board-container">
        <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
                <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">個人訂單列表</h1>
                <p class="text-sm text-slate-500">共 {{ personalOrderList.length }} 筆訂單</p>
            </div>
            <div class="flex w-full flex-col flex-wrap gap-4 sm:w-auto">
                <div class="flex justify-end gap-4">
                    <UButton
                        color="neutral"
                        variant="outline"
                        icon="i-lucide-download"
                        @click="handleExport"
                    >
                        匯出
                    </UButton>
                    <UButton
                        to="/admin/orders/personal/create"
                        color="primary"
                        icon="i-lucide-plus"
                    >
                        新增訂單
                    </UButton>
                </div>
                <div class="flex w-full gap-4 sm:w-auto">
                    <USelect v-model="searchField" :items="searchOptions" class="w-full sm:w-40" />
                    <UInput
                        v-model="searchKeyword"
                        icon="i-lucide-search"
                        placeholder="輸入關鍵字..."
                        class="w-full sm:w-82"
                    >
                        <template v-if="searchKeyword?.length" #trailing>
                            <UButton
                                color="neutral"
                                variant="link"
                                size="sm"
                                icon="i-lucide-circle-x"
                                aria-label="Clear input"
                                @click="searchKeyword = ''"
                            />
                        </template>
                    </UInput>
                </div>
            </div>
        </div>

        <div
            ref="tableContainer"
            class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
            <UTable
                v-model:expanded="expanded"
                v-model:row-selection="rowSelection"
                :data="paginatedOrders"
                :columns="columns"
                :ui="{
                    base: 'min-w-full table-auto',
                    th: 'text-white bg-primary dark:bg-blue-900',
                    tr: 'data-[expanded=true]:bg-elevated/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors'
                }"
                class="flex-1"
            >
                <template #status-cell="{ row }">
                    <div
                        v-if="editingRowId === row.id"
                        class="editing-active flex items-center justify-center gap-2"
                    >
                        <USelect
                            v-model="editingStatus"
                            :items="statusOptions"
                            class="w-48 text-left"
                        />
                        <CommonTooltip text="儲存">
                            <UButton
                                color="secondary"
                                size="sm"
                                icon="i-lucide-save"
                                @click="handleSaveStatus(row)"
                            />
                        </CommonTooltip>
                        <CommonTooltip text="取消">
                            <UButton
                                color="secondary"
                                variant="outline"
                                size="sm"
                                icon="lucide:save-off"
                                @click="editingRowId = null"
                            />
                        </CommonTooltip>
                    </div>
                    <div v-else class="flex items-center gap-2">
                        <CommonTooltip v-if="!editingRowId" text="編輯狀態">
                            <UButton
                                color="secondary"
                                size="sm"
                                icon="i-lucide-edit"
                                aria-label="編輯狀態"
                                @click="startEditing(row)"
                            />
                        </CommonTooltip>
                        <span>{{
                            statusNameMap[String(row.original.status || '')] ||
                            String(row.original.status || '') ||
                            '無'
                        }}</span>
                    </div>
                </template>
                <template #orderDate-cell="{ row }">
                    <ClientOnly>
                        <span>{{ formatDateTime(row.original.orderDate) }}</span>
                        <template #fallback>
                            <span>{{ row.original.orderDate ? '...' : '-' }}</span>
                        </template>
                    </ClientOnly>
                </template>
                <template #expanded="{ row }">
                    <div
                        class="expanded-content-wrapper bg-slate-50 p-4 dark:bg-slate-800/50"
                        :class="{ 'editing-expanded-active': editingRowId === row.id }"
                    >
                        <div class="flex flex-col gap-6">
                            <div
                                class="mb-3 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100"
                            >
                                會員ID：{{ row.original.userId }}
                                <CommonTooltip v-if="row.original.userId" text="複製會員ID">
                                    <UButton
                                        icon="i-lucide-copy"
                                        size="xs"
                                        color="neutral"
                                        variant="ghost"
                                        @click="copyUserId(row.original.userId)"
                                    />
                                </CommonTooltip>
                            </div>
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
                                        {{ thousandthsFormat(totalPriceRow.original.totalPrice) }}
                                    </template>
                                    <template #totalPrice-footer>
                                        {{ thousandthsFormat(row.original.totalPrice) }}
                                    </template>
                                </UTable>
                            </div>

                            <div class="flex gap-6">
                                <!-- 發票資訊 -->
                                <div>
                                    <h3 class="mb-3 font-bold text-slate-900 dark:text-slate-100">
                                        # 發票資訊
                                    </h3>
                                    <UTable
                                        :data="[
                                            {
                                                buyer: row.original.buyer
                                                    ? row.original.buyer
                                                    : '–',
                                                taxId: row.original.taxId ? row.original.taxId : '–'
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
                                    <h3 class="mb-3 font-bold text-slate-900 dark:text-slate-100">
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

            <div
                class="flex flex-col items-center justify-between gap-4 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row dark:border-slate-800 dark:bg-slate-800/30"
            >
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
        </div>
    </div>
</template>

<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { OrderData } from '~/types/order'

const route = useRoute()
const router = useRouter()

const orderStore = useOrderStore()
const { personalOrderList, error, statusOptions } = storeToRefs(orderStore)
const { updatePersonalOrderStatus } = orderStore

await callOnce('initOrders', async () => {
    await orderStore.getPersonalOrders()
})

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
}

async function handleSaveStatus(row: { id: string; original: OrderData }) {
    const { orderId } = row.original
    const updatedStatus = editingStatus.value

    if (updatedStatus === row.original.status) {
        editingRowId.value = null // 關閉編輯模式
        return
    }

    if (orderId && updatedStatus) {
        await updatePersonalOrderStatus(orderId, updatedStatus)
        if (error.value) {
            editingRowId.value = null // 關閉編輯模式
            toastStore.error('更新失敗', error.value)
            return
        }

        row.original.status = editingStatus.value
        editingRowId.value = null // 關閉編輯模式

        toastStore.success('更新成功')
    }
}

async function copyUserId(userId: string) {
    if (!userId) return
    try {
        await navigator.clipboard.writeText(userId)
        toastStore.success('會員ID已複製')
    } catch {
        toastStore.error('複製失敗')
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

// 關鍵字搜尋
const searchKeyword = ref('')
const searchField = ref('orderId')
const searchOptions = [
    { label: '訂單號碼', value: 'orderId' },
    { label: '收件地址', value: 'address' },
    { label: '收件人', value: 'name' },
    { label: '聯絡電話', value: 'phone' },
    { label: '電子信箱', value: 'email' },
    { label: '帳號後五碼', value: 'bankAccountNo' },
    { label: '會員ID', value: 'userId' }
]

// 分頁設定
const pageCount = ref(10)
const pageCountOptions = [10, 20, 40, 100]

// 使用 computed 雙向綁定 URL Query 與分頁狀態
const page = computed({
    get: () => Number(route.query.page) || 1,
    set: (val) => router.replace({ query: { ...route.query, page: val } })
})

const filteredOrders = computed(() => {
    const keyword = searchKeyword.value?.trim().toLowerCase()
    if (!keyword) return personalOrderList.value

    return personalOrderList.value.filter((order) => {
        const targetValue =
            searchField.value === 'address' || searchField.value === 'name'
                ? order.receiver?.[searchField.value]
                : order[searchField.value as keyof OrderData]

        return String(targetValue ?? '')
            .toLowerCase()
            .includes(keyword)
    })
})

watch([searchKeyword, searchField, pageCount], () => {
    page.value = 1
    rowSelection.value = {}
})

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
        header: '訂單日期'
    },
    {
        accessorKey: 'orderId',
        header: '訂單號碼'
    },
    {
        accessorKey: 'status',
        header: '訂單狀態',
        meta: { class: { th: 'text-center', td: 'text-center' } }
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
        accessorKey: 'bankAccountNo',
        header: '帳號後五碼',
        cell: ({ row }) => row.original.bankAccountNo || '-'
    },
    {
        accessorKey: 'remark',
        header: '備註',
        cell: ({ row }) => row.original.remark || '-'
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
            type: 'label',
            label: '操作'
        },
        {
            label: '編輯',
            icon: 'i-lucide-edit',
            async onSelect() {
                const { orderId } = row.original

                await navigateTo({
                    path: `/admin/orders/personal/${orderId}`,
                    query: {
                        page: page.value,
                        action: 'edit'
                    }
                })
            }
        },
        {
            label: '詳情',
            icon: 'i-lucide-file-text',
            async onSelect() {
                const { orderId } = row.original
                await navigateTo({
                    path: `/admin/orders/personal/${orderId}`,
                    query: {
                        page: page.value,
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
