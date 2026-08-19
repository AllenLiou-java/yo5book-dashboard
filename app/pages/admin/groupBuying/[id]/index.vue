<template>
    <div class="mx-auto max-w-5xl">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-4">
            <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">團購內容</h1>
            <div class="flex">
                <div v-if="isReadonly" class="flex gap-4">
                    <UButton
                        :to="`/admin/groupBuying?page=${page}`"
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

        <UForm :schema="schema" :state="state" class="space-y-8 md:w-full" @submit="onSubmit">
            <UCard :ui="{ header: 'bg-primary text-white' }">
                <template #header>
                    <h3 class="flex items-center gap-2 text-lg font-semibold">
                        <UIcon name="i-heroicons-information-circle" class="h-5 w-5 text-white" />
                        基本資訊
                    </h3>
                </template>

                <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                        <div v-if="!isReadonly">
                            <ClientOnly>
                                <ImageUploader
                                    :current-image="state.bannerUrl"
                                    target-folder-name="eventPhoto"
                                    @upload-data="uploadBannerUrl"
                                ></ImageUploader>
                            </ClientOnly>

                            <!-- <UInput
                                v-model="state.bannerUrl"
                                class="w-full"
                                icon="i-heroicons-link"
                                placeholder="https://example.com/banner.jpg"
                                size="lg"
                            /> -->
                        </div>

                        <div v-else-if="state.bannerUrl" class="py-2">
                            <img
                                :src="state.bannerUrl"
                                alt="宣傳圖片"
                                class="max-h-64 rounded-lg border border-slate-200 object-contain shadow-sm dark:border-slate-700"
                            />
                        </div>
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
            </UCard>

            <UCard :ui="{ header: 'bg-primary text-white' }">
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="flex items-center gap-2 text-lg font-semibold">
                            <UIcon name="i-heroicons-archive-box" class="h-5 w-5 text-white" />
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
                </template>

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
            </UCard>

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
                <UButton type="submit" label="確定" icon="i-lucide-save" size="xl" class="px-8" />
            </div>
        </UForm>
    </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import type { ProductSimple } from '~/types/product'
import type { FormState, GroupBuyingData } from '~/types/groupBuying'

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
                productId: z.string().optional(),
                name: z.string().min(1, '請選擇商品'),
                originalPrice: z.number().min(0),
                groupPrice: z
                    .number({
                        required_error: '請輸入團購價',
                        invalid_type_error: '請輸入有效的數字'
                    })
                    .min(0, '團購價不能為負數'),
                isLaunched: z.boolean().optional()
            })
        )
        .min(1, '至少需新增一項商品')
})

const productStore = useProductStore()
const groupBuyingStore = useGroupBuyingStore()
const { productSimpleList } = storeToRefs(productStore)
const { error: groupBuyingError } = storeToRefs(groupBuyingStore)
const toastStore = useToastStore()

const route = useRoute()
const id = computed(() => route.params.id as string)
const page = computed(() => route.query.page || 1)

type StateProduct = {
    productId: string
    name: string
    originalPrice: number
    groupPrice: number
}

// ✅ 預設商品
const defaultProduct = (): StateProduct => ({
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

// 改用 useState 來取代 reactive，確保 SSR 與 Client 端共享同一份狀態，避免 Hydration mismatch
const state = useState<FormState>(`groupBuyingState-${id.value}`, () => defaultState())
const rollbackState = ref<FormState | null>(null)

if (productSimpleList.value.length === 0) {
    await productStore.fetchProductsSimple()
}

const initGroupBuyingById = async (gid: string) => {
    const rawData = await groupBuyingStore.fetchGroupBuyingById(gid)

    const data = JSON.parse(JSON.stringify(rawData))

    Object.assign(state.value, {
        unitName: data.unitName ?? '',
        title: data.title ?? '',
        bannerUrl: data.bannerUrl ?? '',
        description: data.description ?? '',
        endDate: data.endDate ?? '',
        isLaunched: data.isLaunched ?? true,
        products: data.products && data.products.length > 0 ? data.products : [defaultProduct()]
    })
}

await initGroupBuyingById(id.value)

watch(
    () => route.query.action,
    (action) => {
        if (action === 'edit' && !rollbackState.value) {
            setRollbackState()
        }
    },
    { immediate: true }
)

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

const isReadonly = computed(() => route.query.action !== 'edit')

// 建立「已選 productId 清單」
const selectedProductIds = computed(
    () => new Set(state.value.products.map((p) => p.productId).filter((id) => Boolean(id)))
)

const baseProductOptions = computed(() =>
    productSimpleList.value.map((item: ProductSimple) => ({
        value: item.productId,
        label: item.name
    }))
)

// 改寫 items（重點）
const getItems = (currentIndex: number) => {
    const currentId = state.value.products[currentIndex]?.productId

    return baseProductOptions.value.map((option) => ({
        ...option,
        // ✅ 如果是「別列已選」，就 disable
        disabled: selectedProductIds.value.has(option.value) && option.value !== currentId
    }))
}

// 商品清單操作
const addProduct = () => {
    state.value.products.push({ productId: '', name: '', originalPrice: 0, groupPrice: 0 })
}

const removeProduct = (index: number) => {
    if (state.value.products.length > 1) {
        state.value.products.splice(index, 1)
    }
}

const onProductSelect = (productId: string, index: number) => {
    // const selected = products.value.find((p) => p.productId === productId)
    const selected = productSimpleList.value.find((p: ProductSimple) => p.productId === productId)

    if (selected && state.value.products[index]) {
        state.value.products[index].name = selected.name
        state.value.products[index].originalPrice = selected.price.originalPrice
        state.value.products[index].groupPrice = 0
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
}

async function revokeEdit() {
    if (rollbackState.value) {
        state.value = JSON.parse(JSON.stringify(rollbackState.value))
    }

    resetRollbackState()

    await navigateTo({
        query: {
            action: 'view',
            page: page.value
        }
    })
}

function setRollbackState() {
    if (state.value) {
        rollbackState.value = JSON.parse(JSON.stringify(state.value))
    }
}

function resetRollbackState() {
    rollbackState.value = null
}

function isEqualProducts(oldProducts: StateProduct[], newProducts: StateProduct[]) {
    if (oldProducts.length !== newProducts.length) return false

    return oldProducts.every((oldItem, index) => {
        const newItem = newProducts[index]
        if (!newItem) return false

        return (
            oldItem.productId === newItem.productId &&
            oldItem.name === newItem.name &&
            oldItem.originalPrice === newItem.originalPrice &&
            oldItem.groupPrice === newItem.groupPrice
        )
    })
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
            if (!isEqualProducts(oldVal as StateProduct[], newVal as StateProduct[])) {
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
    const updateData: Partial<GroupBuyingData> = getDiff(
        (rollbackState.value || {}) as Record<string, unknown>,
        event.data as Record<string, unknown>
    )

    if (Object.keys(updateData).length === 0) return

    await groupBuyingStore.updateGroupBuyingById(id.value, updateData)
    if (groupBuyingError.value) {
        toastStore.error('更新失敗', groupBuyingError.value)
        return
    }
    toastStore.success('更新成功')

    await navigateTo({
        query: {
            action: 'view'
        }
    })
    resetRollbackState()
}

const uploadBannerUrl = (fileId: string) => {
    if (!fileId) {
        state.value.bannerUrl = ''
        return
    }
    state.value.bannerUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1440`
}
</script>
