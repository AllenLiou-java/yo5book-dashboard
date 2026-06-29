<template>
    <div class="mx-auto max-w-5xl">
        <div class="mb-8">
            <h2 class="text-primary text-3xl font-bold dark:text-slate-100">建立新團購活動</h2>
            <p class="mt-2 text-slate-500 dark:text-slate-400">
                請填寫下方詳細資訊以為您的客戶發起新的團購活動。
            </p>
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
                        />
                        <template #error="{ error }">
                            <span
                                v-if="error"
                                class="text-error mt-1 flex items-center gap-1 text-xs dark:text-red-400"
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
                        />
                    </UFormField>

                    <!-- <UFormField label="宣傳圖片 URL" name="bannerUrl" class="md:col-span-2">
                        <UInput
                            v-model="state.bannerUrl"
                            class="w-full"
                            icon="i-heroicons-link"
                            placeholder="https://example.com/banner.jpg"
                            size="lg"
                        />
                    </UFormField> -->

                    <UFormField label="宣傳圖片 URL" name="bannerUrl" class="md:col-span-2">
                        <ClientOnly>
                            <ImageUploader
                                :current-image="state.bannerUrl"
                                target-folder-name="eventPhoto"
                                @upload-data="uploadBannerUrl"
                            ></ImageUploader>
                        </ClientOnly>
                    </UFormField>

                    <UFormField label="活動描述 URL" name="description" class="md:col-span-2">
                        <EditorToolbar
                            v-model:value="state.description"
                            class="ring-accented rounded-md py-4 ring ring-inset"
                        />
                    </UFormField>

                    <UFormField label="截止日期" name="endDate" required>
                        <UInput
                            v-model="state.endDate"
                            class="w-45"
                            type="date"
                            icon="i-heroicons-calendar"
                            size="lg"
                        />
                    </UFormField>

                    <div class="flex items-center self-end">
                        <USwitch
                            v-model="state.isLaunched"
                            unchecked-icon="i-lucide-x"
                            checked-icon="i-lucide-check"
                            default-value
                            label="是否發佈"
                            size="xl"
                            color="primary"
                        />
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
                    </div>
                </template>

                <UTable :data="state.products" :columns="tableColumns">
                    <template #productId-cell="{ row }">
                        <USelect
                            v-model="state.products[row.index]!.productId"
                            class="min-w-90"
                            :items="getItems(row.index)"
                            size="lg"
                            placeholder="請選擇商品"
                            @update:model-value="onProductSelect($event as string, row.index)"
                        />
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
                            variant="outline"
                            size="lg"
                            class="text-primary min-w-25 font-semibold"
                        />
                    </template>
                    <template #actions-cell="{ row }">
                        <UButton
                            color="error"
                            variant="soft"
                            icon="i-heroicons-trash"
                            :disabled="state.products.length <= 1"
                            @click="removeProduct(row.index)"
                        />
                    </template>
                </UTable>

                <div class="flex justify-center bg-slate-50/50 p-6 dark:bg-slate-800/30">
                    <UButton
                        label="新增商品行"
                        icon="i-heroicons-plus"
                        variant="outline"
                        class="border-dashed"
                        :disabled="isAddProductDisabled"
                        @click="addProduct"
                    />
                </div>
            </UCard>

            <div class="flex items-center justify-end gap-4 pb-12">
                <UButton
                    label="取消"
                    variant="outline"
                    color="primary"
                    size="xl"
                    to="/admin/groupBuying"
                />
                <UButton
                    type="submit"
                    label="建立資料"
                    icon="i-heroicons-check-circle"
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
import type { ProductSimple } from '~/types/product'
import type { FormState } from '~/types/groupBuying'

type Schema = z.output<typeof schema>

const productStore = useProductStore()
const { productSimpleList } = storeToRefs(productStore)

const groupBuyingStore = useGroupBuyingStore()
const { error: groupBuyingError } = storeToRefs(groupBuyingStore)

await callOnce('initProductsSimple', async () => {
    await productStore.fetchProductsSimple()
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

// 2. 表單初始狀態
const state = reactive<FormState>({
    unitName: '',
    title: '',
    bannerUrl: '',
    description: '',
    endDate: '',
    isLaunched: true,
    products: [{ productId: '', name: '', originalPrice: 0, groupPrice: 0 }]
})

// 3. UTable Columns 定義
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

// 建立「已選 productId 清單」
const selectedProductIds = computed(() =>
    state.products.map((p) => p.productId).filter((id) => Boolean(id))
)

// 改寫 items（重點）
const getItems = (currentRowIndex: number) => {
    const currentId = state.products[currentRowIndex]?.productId

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
        name: item.name,
        originalPrice: item.price.originalPrice,
        productId: item.productId
    }))
})

// 判斷是否可以新增商品行
const isAddProductDisabled = computed(() => {
    // 1. 若無商品清單，或已加入的商品行數等於/超過總商品數量，禁止繼續新增
    if (
        productSimpleList.value.length === 0 ||
        state.products.length >= productSimpleList.value.length
    )
        return true

    // 2. 若目前清單中存在「尚未選擇商品」的行，禁止新增 (強制使用者先完成選擇)
    return state.products.some((p) => !p.productId)
})

// 商品清單操作
const addProduct = () => {
    if (isAddProductDisabled.value) return
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

const uploadBannerUrl = (fileId: string) => {
    if (!fileId) {
        state.bannerUrl = ''
        return
    }
    state.bannerUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1440`
}

// 4. 提交表單
async function onSubmit(event: FormSubmitEvent<Schema>) {
    if (event.data) {
        const formState: FormState = event.data

        await groupBuyingStore.addGroupBuyingItem(formState)
        if (groupBuyingError.value) {
            toastStore.error('新增失敗', groupBuyingError.value)
            return
        }
        await navigateTo('/admin/groupBuying')
        toastStore.success('新增成功')
    }
}
</script>
