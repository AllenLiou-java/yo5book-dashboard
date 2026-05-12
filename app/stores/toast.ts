// app/stores/toast.ts
import { defineStore } from 'pinia'

export const useToastStore = defineStore('toast', () => {
    // 取得 Nuxt UI v4 的 toast composable
    const toast = useToast()

    /**
     * 成功提示
     */
    const success = (title: string, description?: string) => {
        toast.add({
            title,
            description,
            color: 'success', // v4 的語意化顏色
            icon: 'i-heroicons-check-circle'
        })
    }

    /**
     * 錯誤提示
     */
    const error = (title: string, description?: string) => {
        toast.add({
            title,
            description,
            color: 'error',
            icon: 'i-heroicons-x-circle',
            // 如果希望錯誤停留久一點，可以覆蓋全域預設的 duration
            duration: 5000
        })
    }

    /**
     * 警告提示
     */
    const warning = (title: string, description?: string) => {
        toast.add({
            title,
            description,
            color: 'warning',
            icon: 'i-heroicons-exclamation-triangle'
        })
    }

    /**
     * 一般資訊
     */
    const info = (title: string, description?: string) => {
        toast.add({
            title,
            description,
            color: 'info',
            icon: 'i-heroicons-information-circle'
        })
    }

    /**
     * 清除所有 Toast
     */
    const clearAll = () => {
        toast.clear()
    }

    return {
        success,
        error,
        warning,
        info,
        clearAll
    }
})
