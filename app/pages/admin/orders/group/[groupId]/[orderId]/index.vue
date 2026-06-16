<template>
    <div class="mx-auto flex max-w-5xl flex-col gap-6">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-4">
            <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">訂單摘要</h1>
            <div class="flex">
                <div v-if="isReadonly" class="flex gap-4">
                    <UButton
                        :to="{
                            path: `/admin/orders/group/${groupId}`,
                            query: {
                                page,
                                unitName,
                                endDate
                            }
                        }"
                        label="上一頁"
                        variant="outline"
                        color="primary"
                        size="xl"
                        icon="lucide:arrow-left-from-line"
                    />

                    <UButton
                        label="編輯"
                        color="primary"
                        size="xl"
                        icon="lucide:edit"
                        @click="onEdit"
                    />
                </div>

                <UButton
                    v-else
                    label="取消"
                    variant="outline"
                    color="primary"
                    size="xl"
                    class="px-8"
                    icon="i-lucide-save-off"
                    @click="revokeEdit"
                />
            </div>
        </div>

        <UForm
            v-if="orderDetail"
            :state="orderDetail"
            class="flex flex-col gap-6"
            @submit="onSubmit"
        >
            <UCard :ui="{ header: 'bg-primary text-white' }">
                <template #header>
                    <h2 class="flex items-center gap-2 text-lg font-semibold">
                        <UIcon name="i-heroicons-information-circle" class="h-5 w-5 text-white" />
                        訂單信息
                    </h2>
                </template>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <UFormField label="訂單號碼">
                        <div class="py-1.5 text-slate-700 dark:text-slate-300">
                            {{ orderDetail.orderId || '-' }}
                        </div>
                    </UFormField>
                    <UFormField label="訂單日期">
                        <div class="py-1.5 text-slate-700 dark:text-slate-300">
                            {{ formatDateTime(orderDetail.orderDate) }}
                        </div>
                    </UFormField>

                    <UFormField label="訂單狀態">
                        <template v-if="!isReadonly">
                            <USelect
                                v-model="orderDetail.status"
                                class="w-full"
                                :items="statusOptions"
                                size="lg"
                            />
                        </template>
                        <div v-else class="py-1.5 text-slate-700 dark:text-slate-300">
                            {{
                                statusOptions.find(
                                    (opt) => String(opt.value) === String(orderDetail?.status)
                                )?.label ||
                                orderDetail?.status ||
                                '-'
                            }}
                        </div>
                    </UFormField>
                    <UFormField label="帳號後五碼">
                        <UInput
                            v-model="orderDetail.bankAccountNo"
                            class="w-full"
                            size="lg"
                            :variant="isReadonly ? 'none' : 'outline'"
                            :readonly="isReadonly"
                        />
                    </UFormField>
                    <UFormField label="備註" class="sm:col-span-2">
                        <UInput
                            v-model="orderDetail.remark"
                            class="w-full"
                            size="lg"
                            :variant="isReadonly ? 'none' : 'outline'"
                            :readonly="isReadonly"
                        />
                    </UFormField>
                </div>
            </UCard>

            <UCard :ui="{ header: 'bg-primary text-white' }">
                <template #header>
                    <h2 class="flex items-center gap-2 text-lg font-semibold">
                        <UIcon name="i-lucide-contact" class="h-5 w-5 text-white" />
                        聯絡人資訊
                    </h2>
                </template>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <UFormField label="收件人">
                        <UInput
                            v-model="orderDetail.receiver.name"
                            class="w-full"
                            size="lg"
                            :variant="isReadonly ? 'none' : 'outline'"
                            :readonly="isReadonly"
                        />
                    </UFormField>
                    <UFormField label="收件地址">
                        <UInput
                            v-model="orderDetail.receiver.address"
                            class="w-full"
                            size="lg"
                            :variant="isReadonly ? 'none' : 'outline'"
                            :readonly="isReadonly"
                        />
                    </UFormField>
                    <UFormField label="聯絡電話">
                        <UInput
                            v-model="orderDetail.phone"
                            class="w-full"
                            size="lg"
                            :variant="isReadonly ? 'none' : 'outline'"
                            :readonly="isReadonly"
                        />
                    </UFormField>
                    <UFormField label="電子信箱">
                        <UInput
                            v-model="orderDetail.email"
                            class="w-full"
                            size="lg"
                            :variant="isReadonly ? 'none' : 'outline'"
                            :readonly="isReadonly"
                        />
                    </UFormField>
                </div>
            </UCard>

            <UCard :ui="{ header: 'bg-primary text-white' }">
                <template #header>
                    <h2 class="flex items-center gap-2 text-lg font-semibold">
                        <UIcon name="i-lucide-tickets" class="h-5 w-5 text-white" />
                        發票資訊
                    </h2>
                </template>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <UFormField label="發票買受人">
                        <UInput
                            v-model="orderDetail.buyer"
                            class="w-full"
                            size="lg"
                            :variant="isReadonly ? 'none' : 'outline'"
                            :readonly="isReadonly"
                        />
                    </UFormField>
                    <UFormField label="統一編號">
                        <UInput
                            v-model="orderDetail.taxId"
                            class="w-full"
                            size="lg"
                            :variant="isReadonly ? 'none' : 'outline'"
                            :readonly="isReadonly"
                        />
                    </UFormField>
                </div>
            </UCard>

            <UCard :ui="{ header: 'bg-primary text-white' }">
                <template #header>
                    <h2 class="flex items-center gap-2 text-lg font-semibold">
                        <UIcon name="i-lucide-package-search" class="h-5 w-5 text-white" />
                        包裹查詢
                    </h2>
                </template>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <UFormField label="配送方式">
                        <UInput
                            v-model="orderDetail.delivery.company"
                            class="w-full"
                            size="lg"
                            :variant="isReadonly ? 'none' : 'outline'"
                            :readonly="isReadonly"
                        />
                    </UFormField>
                    <UFormField label="追蹤碼">
                        <UInput
                            v-model="orderDetail.delivery.trackingNo"
                            class="w-full"
                            size="lg"
                            :variant="isReadonly ? 'none' : 'outline'"
                            :readonly="isReadonly"
                        >
                            <template v-if="isReadonly && orderDetail.delivery.trackingNo" #leading>
                                <CommonTooltip text="複製追蹤碼">
                                    <UButton
                                        icon="i-lucide-copy"
                                        size="xs"
                                        color="neutral"
                                        variant="ghost"
                                        @click="copyTrackingNo(orderDetail.delivery.trackingNo)"
                                    />
                                </CommonTooltip>
                            </template>
                        </UInput>
                    </UFormField>
                    <UFormField label="查詢連結">
                        <div v-if="isReadonly" class="py-1.5 text-slate-700 dark:text-slate-300">
                            <a
                                v-if="orderDetail.delivery.trackingUrl"
                                :href="orderDetail.delivery.trackingUrl"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="text-primary break-all hover:underline"
                            >
                                {{ orderDetail.delivery.trackingUrl }}
                            </a>
                            <span v-else>-</span>
                        </div>
                        <UInput
                            v-else
                            v-model="orderDetail.delivery.trackingUrl"
                            class="w-full"
                            size="lg"
                        />
                    </UFormField>
                </div>
            </UCard>

            <UCard :ui="{ header: 'bg-primary text-white' }">
                <template #header>
                    <h2 class="flex items-center gap-2 text-lg font-semibold">
                        <UIcon name="i-lucide-list-ordered" class="h-5 w-5 text-white" />
                        訂單商品
                    </h2>
                </template>
                <UTable :data="orderListArray" :columns="columns" class="w-full">
                    <template #totalPrice-cell="{ row }">
                        {{ thousandthsFormat((row.original as OrderItem).totalPrice) }}
                    </template>
                </UTable>
            </UCard>

            <!-- 底部操作按鈕 -->
            <div v-if="!isReadonly" class="mt-4 flex items-center justify-end gap-4 pb-12">
                <UButton
                    label="取消"
                    variant="outline"
                    color="primary"
                    size="xl"
                    class="px-8"
                    icon="i-lucide-save-off"
                    @click="revokeEdit"
                />
                <UButton type="submit" label="確定" icon="i-lucide-save" size="xl" class="px-8" />
            </div>
        </UForm>

        <div v-else class="py-10 text-center text-slate-500">載入中...</div>
    </div>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import type { OrderData, OrderItem } from '~/types/order'
const orderStore = useOrderStore()
const { statusOptions, error } = storeToRefs(orderStore)

const toastStore = useToastStore()

const route = useRoute()
const page = computed(() => route.query.page || 1)
const unitName = computed(() => route.query.unitName as string)
const endDate = computed(() => route.query.endDate as string)
const groupId = computed(() => route.params.groupId as string)
const orderId = computed(() => route.params.orderId as string)

const action = computed(() => route.query.action as string)
const isReadonly = computed(() => action.value !== 'edit')

// 改用 useState 來取代 ref，確保 SSR 與 Client 端共享同一份狀態，避免 Hydration mismatch
const orderDetail = useState<OrderData | null>(`orderDetailState-${orderId.value}`, () => null)

await callOnce(`fetchGroupOrderDetail-${orderId.value}`, async () => {
    if (!orderId.value || !groupId.value) return
    const rawData = await orderStore.getGroupOrderDetailById(groupId.value, orderId.value)
    if (!rawData) return

    // 將 fetch 取回的資料深拷貝，避免 input v-model 編輯時改到 Store 的原始資料
    const data = JSON.parse(JSON.stringify(rawData))
    // 預防資料無 receiver 結構時報錯
    if (!data.receiver) {
        data.receiver = { name: '', address: '' }
    }
    orderDetail.value = data
})

const columns = [
    { accessorKey: 'productName', header: '商品名稱' },
    { accessorKey: 'qty', header: '訂購數' },
    { accessorKey: 'totalPrice', header: '總金額' }
]

const orderListArray = computed(() => Object.values(orderDetail.value?.orderList || {}))

const rollbackState = ref<OrderData | null>(null)

function setRollbackState() {
    if (orderDetail.value) {
        rollbackState.value = JSON.parse(JSON.stringify(orderDetail.value))
    }
}

function resetRollbackState() {
    rollbackState.value = null
}

watch(
    action,
    (newAction) => {
        if (newAction === 'edit' && !rollbackState.value) {
            setRollbackState()
        }
    },
    { immediate: true }
)

async function onEdit() {
    setRollbackState()
    await navigateTo({
        query: {
            ...route.query,
            action: 'edit'
        }
    })
}

async function revokeEdit() {
    if (rollbackState.value) {
        orderDetail.value = JSON.parse(JSON.stringify(rollbackState.value))
    }
    resetRollbackState()

    await navigateTo({
        query: {
            ...route.query,
            action: 'view'
        }
    })
}

async function copyTrackingNo(trackingNo?: string) {
    if (!trackingNo) return
    try {
        await navigator.clipboard.writeText(trackingNo)
        toastStore.success('追蹤碼已複製')
    } catch {
        toastStore.error('複製失敗')
    }
}

// 檢查出異動欄位資料
function getDiff<T>(oldObj: T, newObj: T): Partial<T> {
    const diff: Record<string, unknown> = {}

    /*
    val is Record<string, unknown> 是函式的「回傳型別 (Return Type)」。
        is 關鍵字：這是核心所在。它告訴 TypeScript：
        「如果這個函式執行完回傳的是 true，那麼在接下來的程式碼區塊中，請直接把 val 認定為 Record<string, unknown> 這個型別」。
    */
    const isObject = (val: unknown): val is Record<string, unknown> =>
        !!val && typeof val === 'object' && !Array.isArray(val)

    const keys = new Set([
        ...Object.keys((oldObj || {}) as Record<string, unknown>),
        ...Object.keys((newObj || {}) as Record<string, unknown>)
    ])

    keys.forEach((key) => {
        const oldVal = (oldObj as Record<string, unknown>)[key]
        const newVal = (newObj as Record<string, unknown>)[key]

        // 陣列處理
        if (Array.isArray(oldVal) && Array.isArray(newVal)) {
            if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
                diff[key] = newVal
            }
        }
        // 物件遞迴
        else if (isObject(oldVal) && isObject(newVal)) {
            const nestedDiff = getDiff(oldVal, newVal)

            if (Object.keys(nestedDiff).length > 0) {
                diff[key] = nestedDiff
            }
        }
        // 一般值
        else {
            if (oldVal !== newVal) {
                diff[key] = newVal
            }
        }
    })

    return diff as Partial<T>
}

async function onSubmit(event: FormSubmitEvent<OrderData>) {
    if (event.data) {
        const updateData = getDiff(
            (rollbackState.value || {}) as OrderData,
            event.data as OrderData
        )

        if (Object.keys(updateData).length === 0) return

        await orderStore.updateGroupOrder(groupId.value, orderId.value, updateData)

        if (error.value) {
            toastStore.error('更新失敗', error.value)
            return
        }

        toastStore.success('更新成功')

        await navigateTo({
            query: {
                ...route.query,
                action: 'view'
            }
        })
    }
}
</script>

<style scoped></style>
