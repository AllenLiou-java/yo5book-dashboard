<template>
    <main
        class="dark:bg-background-dark/50 h-[calc(100vh-64px)] flex-1 overflow-x-auto bg-slate-50 p-8"
    >
        <div class="mx-auto max-w-5xl">
            <div class="mb-8 flex justify-end">
                <div v-if="isReadonly" class="flex gap-4">
                    <NuxtLink :to="`/admin/groupBuying?page=${page}`">
                        <UButton
                            label="上一頁"
                            variant="outline"
                            color="primary"
                            size="xl"
                            icon="lucide:arrow-left-from-line"
                        />
                    </NuxtLink>

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

            <UForm :schema="schema" :state="state" class="space-y-8 md:w-full" @submit="onSubmit">
                <section
                    class="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                    <div class="border-b border-slate-100 p-6 dark:border-slate-800">
                        <h3 class="flex items-center gap-2 text-lg font-semibold">
                            <UIcon
                                name="i-heroicons-information-circle"
                                class="text-primary h-5 w-5"
                            />
                            基本資訊
                        </h3>
                    </div>

                    <div class="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
                        <UFormField label="團購單位" name="unitName" required>
                            <UInput
                                v-model="state.unitName"
                                class="w-full"
                                placeholder="例如：XXX公會"
                                size="lg"
                                :variant="isReadonly ? 'none' : 'outline'"
                                :readonly="isReadonly"
                            />
                            <template #error="{ error }">
                                <span
                                    v-if="error"
                                    class="mt-1 flex items-center gap-1 text-xs text-red-500 dark:text-red-400"
                                >
                                    <UIcon name="i-heroicons-exclamation-circle" />
                                    {{ error }}
                                </span>
                            </template>
                        </UFormField>

                        <UFormField label="活動標題" name="title" required>
                            <UInput
                                v-model="state.title"
                                class="w-full"
                                placeholder="例如：XXX公會團購活動"
                                size="lg"
                                :variant="isReadonly ? 'none' : 'outline'"
                                :readonly="isReadonly"
                            />
                        </UFormField>

                        <UFormField label="宣傳圖片 URL" name="bannerUrl" class="md:col-span-2">
                            <UInput
                                v-model="state.bannerUrl"
                                class="w-full"
                                icon="i-heroicons-link"
                                placeholder="https://example.com/banner.jpg"
                                size="lg"
                                :variant="isReadonly ? 'none' : 'outline'"
                                :readonly="isReadonly"
                            />
                        </UFormField>

                        <div class="flex flex-col gap-1 text-sm md:col-span-2">
                            <span class="text-default block font-medium">活動描述</span>
                            <template v-if="!isReadonly">
                                <EditorToolbar
                                    v-model:value="state.description"
                                    class="ring-accented rounded-md py-4 ring ring-inset"
                                />
                            </template>
                            <template v-else>
                                <ClientOnly>
                                    <p class="p-4" v-html="state.description"></p>
                                </ClientOnly>
                            </template>
                        </div>

                        <UFormField label="截止日期" name="endDate" required>
                            <UInput
                                v-model="state.endDate"
                                class="w-45"
                                type="date"
                                icon="i-heroicons-calendar"
                                size="lg"
                                :variant="isReadonly ? 'none' : 'outline'"
                                :readonly="isReadonly"
                            />
                        </UFormField>

                        <div class="flex items-center self-end">
                            <FormFieldWrapper :readonly="isReadonly">
                                <USwitch
                                    v-model="state.isLaunched"
                                    unchecked-icon="i-lucide-x"
                                    checked-icon="i-lucide-check"
                                    default-value
                                    label="是否發佈"
                                    size="xl"
                                    color="primary"
                                />
                            </FormFieldWrapper>
                        </div>
                    </div>
                </section>

                <section
                    class="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                    <div
                        class="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800"
                    >
                        <h3 class="flex items-center gap-2 text-lg font-semibold">
                            <UIcon name="i-heroicons-archive-box" class="text-primary h-5 w-5" />
                            商品清單
                        </h3>
                        <UButton
                            v-if="!isReadonly"
                            color="primary"
                            variant="ghost"
                            icon="i-heroicons-plus-circle"
                            label="新增商品"
                            class="font-bold"
                            @click="addProduct"
                        />
                    </div>

                    <div>
                        <UTable :data="state.products" :columns="tableColumns">
                            <template #productId-cell="{ row }">
                                <div v-if="!isReadonly">
                                    <USelect
                                        v-model="state.products[row.index]!.productId"
                                        class="min-w-90"
                                        :items="getItems(row.index)"
                                        size="lg"
                                        placeholder="請選擇商品"
                                        @update:model-value="
                                            onProductSelect($event as string, row.index)
                                        "
                                    />
                                </div>
                                <p v-else>
                                    {{ state.products[row.index]!.name }}
                                </p>
                            </template>

                            <template #originalPrice-cell="{ row }">
                                <span
                                    v-if="state.products[row.index]"
                                    class="text-slate-600 dark:text-slate-400"
                                >
                                    {{ state.products[row.index]!.originalPrice }}
                                </span>
                            </template>
                            <template #groupPrice-cell="{ row }">
                                <UInput
                                    v-model.number="state.products[row.index]!.groupPrice"
                                    type="number"
                                    placeholder="輸入團購價"
                                    size="lg"
                                    class="text-primary min-w-25 font-semibold"
                                    :variant="isReadonly ? 'none' : 'outline'"
                                    :readonly="isReadonly"
                                />
                            </template>
                            <template #actions-cell="{ row }">
                                <UButton
                                    v-if="!isReadonly"
                                    color="error"
                                    variant="soft"
                                    icon="i-heroicons-trash"
                                    :disabled="state.products.length <= 1"
                                    @click="removeProduct(row.index)"
                                />
                            </template>
                        </UTable>

                        <div
                            v-if="!isReadonly"
                            class="flex justify-center bg-slate-50/50 p-6 dark:bg-slate-800/30"
                        >
                            <UButton
                                label="新增商品行"
                                icon="i-heroicons-plus"
                                variant="outline"
                                class="border-dashed"
                                @click="addProduct"
                            />
                        </div>
                    </div>
                </section>

                <div v-if="!isReadonly" class="flex items-center justify-end gap-4 pb-12">
                    <UButton
                        label="取消"
                        variant="outline"
                        color="primary"
                        size="xl"
                        class="px-8"
                        icon="i-lucide-save-off"
                        @click="revokeEdit"
                    />
                    <UButton
                        type="submit"
                        label="確定"
                        icon="i-lucide-save"
                        size="xl"
                        class="px-8"
                    />
                </div>
            </UForm>
        </div>
    </main>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import type { ProductSimple } from '~/types/product'
import type { FormState } from '~/types/groupBuying'

type Schema = z.output<typeof schema>
// 1. 定義 Zod 驗證 Schema
const schema = z.object({
    unitName: z.string().min(1, '請輸入單位名稱'),
    title: z.string().min(2, '標題至少需要 2 個字'),
    bannerUrl: z.string().url('請輸入正確的 URL 格式').or(z.string().length(0)),
    description: z.string().optional(),
    endDate: z.string().min(1, '請選擇截止日期'),
    isLaunched: z.boolean(),
    products: z
        .array(
            z.object({
                productId: z.string().min(1, '請選擇商品'),
                name: z.string().min(1, '請選擇商品'),
                originalPrice: z.number().min(0),
                groupPrice: z
                    .number({
                        required_error: '請輸入團購價',
                        invalid_type_error: '請輸入有效的數字'
                    })
                    .min(0, '團購價不能為負數')
            })
        )
        .min(1, '至少需新增一項商品')
})

const productStore = useProductStore()
const groupBuyingStore = useGroupBuyingStore()
const { productSimpleList } = storeToRefs(productStore)
const { list: groupBuyingList } = storeToRefs(groupBuyingStore)

const route = useRoute()
const id = computed(() => route.params.id as string)
const page = computed(() => route.query.page || 1)

// 使用 useAsyncData 確保在伺服器端渲染時也能初始化資料
await useAsyncData(
    () => `initGroupBuying-${id.value}`,
    async () => {
        await groupBuyingStore.fetchGroupBuyingById(id.value)
        return true
    }
)

type stateProduct = {
    productId: string
    name: string
    originalPrice: number
    groupPrice: number
}

// ✅ 預設商品
const defaultProduct = (): stateProduct => ({
    productId: '',
    name: '',
    originalPrice: 0,
    groupPrice: 0
})

const defaultState = (): FormState => ({
    unitName: '',
    title: '',
    bannerUrl: '',
    description: '',
    endDate: '',
    isLaunched: true,
    products: [defaultProduct()]
})

// 2. 表單初始狀態
const state = reactive<FormState>(defaultState())

const rollbackState = reactive<FormState>(defaultState())

// ✅ 當資料載入後再填入 state
watch(
    () => route.query.action,
    (action) => {
        if (action === 'edit') {
            setInitState()
            setRollbackState()
        } else {
            setInitState()
        }
    },
    { immediate: true, deep: true }
)

function setInitState() {
    // map 提升查找效能
    const groupBuyingMap = new Map(groupBuyingList.value.map((item) => [item.gid, item]))
    const groupBuyingData = groupBuyingMap.get(id.value)

    if (!groupBuyingData) return

    state.unitName = groupBuyingData.unitName ?? ''
    state.title = groupBuyingData.title ?? ''
    state.bannerUrl = groupBuyingData.bannerUrl ?? ''
    state.description = groupBuyingData.description ?? ''
    state.endDate = groupBuyingData.endDate ?? ''
    state.isLaunched = groupBuyingData.isLaunched ?? true
    state.products = groupBuyingData.products
        ? JSON.parse(JSON.stringify(groupBuyingData.products))
        : [defaultProduct()]
}

// UTable Columns 定義
const tableColumns = [
    {
        accessorKey: 'productId',
        header: '商品名稱'
    },
    {
        accessorKey: 'originalPrice',
        header: '原價 ($)'
    },
    {
        accessorKey: 'groupPrice',
        header: '團購價 ($)'
    },
    {
        id: 'actions',
        header: '操作',
        meta: { class: { th: 'text-center', td: 'text-center' } }
    }
]

const isReadonly = computed(() => {
    if (route.query.action === 'edit') {
        return false
    } else {
        return true
    }
})

// 建立「已選 productId 清單」
const selectedProductIds = computed(() =>
    state.products.map((p) => p.productId).filter((id) => Boolean(id))
)

// 改寫 items（重點）
const getItems = (currentIndex: number) => {
    const currentId = state.products[currentIndex]?.productId

    return productSimpleList.value.map((item: ProductSimple) => {
        const isSelected = selectedProductIds.value.includes(item.productId)

        return {
            value: item.productId,
            label: item.name,

            // ✅ 如果是「別列已選」，就 disable
            disabled: isSelected && item.productId !== currentId
        }
    })
}

const products = computed(() => {
    return productSimpleList.value.map((item: ProductSimple) => ({
        imgSrc: item.imgSrc,
        name: item.name,
        originalPrice: item.price.originalPrice,
        productId: item.productId,
        selected: false
    }))
})

// 商品清單操作
const addProduct = () => {
    state.products.push({ productId: '', name: '', originalPrice: 0, groupPrice: 0 })
}

const removeProduct = (index: number) => {
    if (state.products.length > 1) {
        state.products.splice(index, 1)
    }
}

const onProductSelect = (productId: string, index: number) => {
    const selected = products.value.find((p) => p.productId === productId)

    if (selected && state.products[index]) {
        state.products[index].name = selected.name
        state.products[index].originalPrice = selected.originalPrice
        state.products[index].groupPrice = 0
    }
}

async function onEdit() {
    await navigateTo({
        query: {
            action: 'edit',
            page: page.value
        }
    })
    setRollbackState()

    if (productSimpleList.value.length === 0) {
        await productStore.fetchProductsSimple()
    }
}

async function revokeEdit() {
    const temp = JSON.parse(JSON.stringify(rollbackState))
    state.unitName = temp.unitName
    state.title = temp.title
    state.bannerUrl = temp.bannerUrl
    state.description = temp.description
    state.endDate = temp.endDate
    state.isLaunched = temp.isLaunched
    state.products = temp.products

    resetRollbackState()

    await navigateTo({
        query: {
            action: 'view',
            page: page.value
        }
    })
}

function setRollbackState() {
    const temp = JSON.parse(JSON.stringify(state))
    rollbackState.unitName = temp.unitName
    rollbackState.title = temp.title
    rollbackState.bannerUrl = temp.bannerUrl
    rollbackState.description = temp.description
    rollbackState.endDate = temp.endDate
    rollbackState.isLaunched = temp.isLaunched
    rollbackState.products = temp.products
}

function resetRollbackState() {
    Object.assign(rollbackState, defaultState())
}

function isEqualProducts(oldProducts: stateProduct[], newProducts: stateProduct[]) {
    if (oldProducts.length !== newProducts.length) return false

    const oldMap = new Map(oldProducts.map((p) => [p.productId, p]))
    const newMap = new Map(newProducts.map((p) => [p.productId, p]))

    for (const [id, oldItem] of oldMap) {
        const newItem = newMap.get(id)
        if (!newItem) return false

        if (
            oldItem.name !== newItem.name ||
            oldItem.originalPrice !== newItem.originalPrice ||
            oldItem.groupPrice !== newItem.groupPrice
        ) {
            return false
        }
    }

    return true
}

// 檢查出異動欄位資料
function getDiff(oldObj: Record<string, unknown>, newObj: Record<string, unknown>) {
    const diff: Record<string, unknown> = {}

    const isObject = (val: unknown): val is Record<string, unknown> =>
        !!val && typeof val === 'object' && !Array.isArray(val)

    const keys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})])

    keys.forEach((key) => {
        const oldVal = oldObj?.[key]
        const newVal = newObj?.[key]

        if (key === 'products') {
            if (!isEqualProducts(oldVal as stateProduct[], newVal as stateProduct[])) {
                diff[key] = newVal
            }
        }

        // 陣列處理
        else if (Array.isArray(oldVal) && Array.isArray(newVal)) {
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

    return diff
}

// 4. 提交表單
async function onSubmit(event: FormSubmitEvent<Schema>) {
    const updateData = getDiff(rollbackState, event.data)

    if (Object.keys(updateData).length === 0) return

    await groupBuyingStore.updateGroupBuyingById(id.value, updateData)

    await navigateTo({
        query: {
            action: 'view'
        }
    })
    resetRollbackState()
}
</script>
