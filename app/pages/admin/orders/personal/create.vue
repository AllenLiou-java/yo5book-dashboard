<template>
    <div class="mx-auto flex max-w-5xl flex-col gap-6">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-4">
            <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">新增訂單</h1>
            <div class="flex">
                <UButton
                    :to="`/admin/orders/personal?page=${page}`"
                    label="回列表"
                    variant="outline"
                    color="primary"
                    size="xl"
                    icon="lucide:arrow-left-from-line"
                />
            </div>
        </div>

        <UForm :schema="schema" :state="orderDetail" class="flex flex-col gap-6" @submit="onSubmit">
            <UCard :ui="{ header: 'bg-primary text-white' }">
                <template #header>
                    <h2 class="flex items-center gap-2 text-lg font-semibold">
                        <UIcon name="i-heroicons-information-circle" class="h-5 w-5 text-white" />
                        訂單信息
                    </h2>
                </template>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <UFormField label="訂單狀態" name="status">
                        <USelect
                            v-model="orderDetail.status"
                            class="w-full"
                            :items="statusOptions"
                            size="lg"
                        />
                    </UFormField>
                    <UFormField label="帳號後五碼" name="bankAccountNo">
                        <UInput
                            v-model="orderDetail.bankAccountNo"
                            placeholder="若尚未確認，請填寫 00000"
                            class="w-full"
                            size="lg"
                        />
                    </UFormField>
                    <UFormField label="備註" class="sm:col-span-2" name="remark">
                        <UInput v-model="orderDetail.remark" class="w-full" size="lg" />
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
                    <UFormField label="收件人" name="receiver.name">
                        <UInput v-model="orderDetail.receiver!.name" class="w-full" size="lg" />
                    </UFormField>
                    <UFormField label="收件地址" name="receiver.address">
                        <UInput v-model="orderDetail.receiver!.address" class="w-full" size="lg" />
                    </UFormField>
                    <UFormField label="聯絡電話" name="phone">
                        <UInput v-model="orderDetail.phone!" class="w-full" size="lg" />
                    </UFormField>
                    <UFormField label="電子信箱" name="email">
                        <UInput v-model="orderDetail.email!" class="w-full" size="lg" />
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
                    <UFormField label="發票買受人" name="buyer">
                        <UInput v-model="orderDetail.buyer!" class="w-full" size="lg" />
                    </UFormField>
                    <UFormField label="統一編號" name="taxId">
                        <UInput v-model="orderDetail.taxId!" class="w-full" size="lg" />
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
                    <UFormField label="配送方式" name="delivery.company">
                        <UInput
                            v-model="orderDetail.delivery!.company"
                            placeholder="預設：郵局"
                            class="w-full"
                            size="lg"
                        />
                    </UFormField>
                    <UFormField label="追蹤碼" name="delivery.trackingNo">
                        <UInput
                            v-model="orderDetail.delivery!.trackingNo"
                            class="w-full"
                            size="lg"
                        />
                    </UFormField>
                    <UFormField label="查詢連結" name="delivery.trackingUrl">
                        <UInput
                            v-model="orderDetail.delivery!.trackingUrl"
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
                <UTable :data="orderDetail.orderList!" :columns="tableColumns" class="w-full">
                    <template #productName-cell="{ row }">
                        <USelect
                            v-model="orderDetail.orderList![row.index]!.productName"
                            :items="getItems(row.index)!"
                            size="lg"
                            placeholder="請選擇商品"
                            class="min-w-90"
                            @update:model-value="onProductSelect($event as string, row.index)"
                        />
                    </template>
                    <template #unitPrice-cell="{ row }">
                        <span class="text-slate-600 dark:text-slate-400">
                            {{
                                thousandthsFormat(orderDetail.orderList![row.index]?.unitPrice || 0)
                            }}
                        </span>
                    </template>
                    <template #qty-cell="{ row }">
                        <UInput
                            v-model.number="orderDetail.orderList![row.index]!.qty"
                            type="number"
                            min="1"
                            size="lg"
                            class="w-24"
                            @update:model-value="updateOrderItemTotalPrice(row.index)"
                        />
                    </template>
                    <template #totalPrice-cell="{ row }">
                        <span class="text-primary font-semibold">
                            {{
                                thousandthsFormat(
                                    orderDetail.orderList?.[row.index]?.totalPrice || 0
                                )
                            }}
                        </span>
                    </template>
                    <template #actions-cell="{ row }">
                        <UButton
                            icon="i-lucide-trash-2"
                            variant="soft"
                            color="error"
                            :disabled="(orderDetail.orderList?.length || 0) <= 1"
                            @click="removeProduct(row.index)"
                        />
                    </template>
                </UTable>
                <div
                    class="flex items-center justify-end border-t border-slate-200 p-6 dark:border-slate-800"
                >
                    <span class="text-lg font-medium text-slate-700 dark:text-slate-300"
                        >合計金額：</span
                    >
                    <span class="text-primary ml-4 text-2xl font-bold">
                        $ {{ thousandthsFormat(orderDetail.totalPrice || 0) }}
                    </span>
                </div>
                <div class="flex justify-center bg-slate-50/50 p-6 dark:bg-slate-800/30">
                    <UButton
                        label="新增商品行"
                        icon="i-lucide-plus"
                        variant="outline"
                        class="border-dashed"
                        :disabled="isAddProductDisabled"
                        @click="addProduct"
                    />
                </div>
            </UCard>

            <!-- 底部操作按鈕 -->
            <div class="mt-4 flex items-center justify-end gap-4 pb-12">
                <UButton
                    :to="`/admin/orders/personal?page=${page}`"
                    label="取消"
                    variant="outline"
                    color="primary"
                    size="xl"
                    class="px-8"
                    icon="i-lucide-x"
                />
                <UButton
                    type="submit"
                    label="新增訂單"
                    icon="i-lucide-plus"
                    size="xl"
                    class="px-8"
                />
            </div>
        </UForm>
    </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import type { OrderData } from '~/types/order'
import type { ProductSimple } from '~/types/product'

const orderStore = useOrderStore()
const { statusOptions, error } = storeToRefs(orderStore)

const productStore = useProductStore()
const { productSimpleList } = storeToRefs(productStore)

await callOnce('fetchProductSimpleList', async () => {
    await productStore.fetchProductsSimple()
})

const route = useRoute()
const toastStore = useToastStore()
const page = computed(() => route.query.page || 1)

const tableColumns = [
    { accessorKey: 'productName', header: '商品名稱' },
    { accessorKey: 'unitPrice', header: '優惠價 ($)' },
    { accessorKey: 'qty', header: '訂購數' },
    { accessorKey: 'totalPrice', header: '總金額' },
    { id: 'actions', header: '操作', meta: { class: { th: 'text-center', td: 'text-center' } } }
]

const schema = z.object({
    bankAccountNo: z.string().min(5, '若尚未確認，請填 00000'),
    buyer: z.string().optional(),
    delivery: z
        .object({
            company: z.string().optional(),
            trackingNo: z.string().optional(),
            trackingUrl: z.string().url('請輸入正確的 URL 格式').or(z.string().length(0)).optional()
        })
        .optional(),
    email: z.string().email('請輸入正確的電子信箱').or(z.string().length(0)).optional(),
    orderList: z
        .array(
            z.object({
                productId: z.string().min(1, '請選擇商品'),
                productName: z.string().min(1, '請選擇商品'),
                qty: z.number().min(1, '數量至少為 1'),
                unitPrice: z.number().min(0),
                totalPrice: z.number().min(0)
            })
        )
        .min(1, '至少需新增一項商品'),
    phone: z.string().min(1, '請輸入聯絡電話'),
    receiver: z.object({
        name: z.string().min(1, '請輸入收件人姓名'),
        address: z.string().min(1, '請輸入收件地址')
    }),
    remark: z.string().optional(),
    status: z.string().min(1, '請選擇訂單狀態'),
    taxId: z.string().optional(),
    totalPrice: z.number().min(0).optional()
})

type Schema = z.output<typeof schema>

// 初始化空的新增訂單資料
const orderDetail = reactive<Schema>({
    bankAccountNo: '',
    buyer: '',
    delivery: { company: '郵局', trackingNo: '', trackingUrl: '' },
    email: '',
    orderList: [{ productId: '', productName: '', qty: 1, unitPrice: 0, totalPrice: 0 }],
    phone: '',
    receiver: { name: '', address: '' },
    remark: '',
    status: '1',
    taxId: '',
    totalPrice: 0
})

// 建立「已選 productId 清單」
const selectedProductIds = computed(() =>
    (orderDetail.orderList || [])
        .map((order) => order.productId)
        .filter((productId) => Boolean(productId))
)

// 改寫 items（重點）
const getItems = (currentRowIndex: number) => {
    const currentId = orderDetail.orderList?.[currentRowIndex]?.productId

    return productSimpleList.value.flatMap((productSimple: ProductSimple) => {
        if (!productSimple.productId) return []

        return {
            value: productSimple.name, // 修正：對應 v-model 綁定的 productName，避免選取時帶入 ID
            label: productSimple.name,
            // ✅ 如果是「別列已選」，就 disable
            disabled:
                selectedProductIds.value.includes(productSimple.productId) &&
                productSimple.productId !== currentId
        }
    })
}

// 判斷是否可以新增商品行
const isAddProductDisabled = computed(() => {
    // 1. 若無商品清單，或已加入的商品行數等於/超過總商品數量，禁止繼續新增
    if (
        productSimpleList.value.length === 0 ||
        (orderDetail.orderList?.length || 0) >= productSimpleList.value.length
    )
        return true

    // 2. 若目前清單中存在「尚未選擇商品」的行，禁止新增 (強制使用者先完成選擇)
    return (orderDetail.orderList || []).some((p) => !p.productName)
})

function addProduct() {
    if (isAddProductDisabled.value) return
    orderDetail.orderList?.push({
        productId: '',
        productName: '',
        qty: 1,
        unitPrice: 0,
        totalPrice: 0
    })
}

function removeProduct(index: number) {
    if ((orderDetail.orderList?.length || 0) > 1) {
        orderDetail.orderList?.splice(index, 1)
        updateOrderLstTotalPrice()
    }
}

function updateOrderItemTotalPrice(index: number) {
    const item = orderDetail.orderList?.[index]
    if (item) {
        item.totalPrice = (item.unitPrice || 0) * (item.qty || 1)
    }
    updateOrderLstTotalPrice()
}

function updateOrderLstTotalPrice() {
    let grandTotal = 0
    orderDetail.orderList?.forEach((item) => {
        grandTotal += item.totalPrice || 0
    })
    orderDetail.totalPrice = grandTotal
}

function onProductSelect(productName: string, index: number) {
    const product = productSimpleList.value.find((p) => p.name === productName)
    const item = orderDetail.orderList?.[index]

    if (product && item) {
        item.unitPrice = product.price?.discount || product.price?.originalPrice || 0
        item.productId = product.productId as string
        updateOrderItemTotalPrice(index)
    }
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
    if (event.data) {
        // 將驗證過後的 event.data 轉型並作為送出的資料
        const submitData = { ...event.data } as unknown as OrderData

        await orderStore.createPersonalOrder(submitData)

        if (error.value) {
            toastStore.error('新增失敗', error.value)
            return
        }

        toastStore.success('新增成功')

        await navigateTo({
            path: '/admin/orders/personal',
            query: { page: page.value || 1 }
        })
    }
}
</script>

<style scoped></style>
