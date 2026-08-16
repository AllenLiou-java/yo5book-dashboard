import { defineStore } from 'pinia'
import type { ProductSimple } from '~/types/product'

export const useProductStore = defineStore('product', () => {
    // 狀態 (State)
    const productSimpleList = ref<ProductSimple[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    const productSimple = useProductSimple()

    // 計算屬性 (Getters)
    const totalItems = computed(() => productSimpleList.value.length)

    // 動作 (Actions)
    const fetchProductsSimple = async () => {
        isLoading.value = true
        error.value = null

        try {
            const { data, success } = await productSimple.findAll()

            if (success) {
                // 處理 Firebase 回傳的物件格式（轉為陣列方便前端渲染）
                if (data) {
                    productSimpleList.value = data
                } else {
                    productSimpleList.value = []
                }
            }
        } catch (err: unknown) {
            error.value = getErrorMessage(err, '無法取得產品(Simple)資料')
        } finally {
            isLoading.value = false
        }
    }

    return {
        productSimpleList,
        isLoading,
        error,
        totalItems,
        fetchProductsSimple
    }
})
