import { ref } from 'vue'
import { GoogleDriveMapRepository } from '~/domain/repositories/GoogleDriveMapRepository'

export interface GoogleDriveFile {
    id: string
    name?: string
    mimeType?: string
    webViewLink?: string
    webContentLink?: string
}

export function useGoogleDrive() {
    // 定義共用狀態
    const isUploading = ref(false)
    const isDeleting = ref(false)
    const progress = ref(0)
    const result = ref<GoogleDriveFile | null>(null)
    const error = ref<string | null>(null)
    const previewUrl = ref<string | null>(null)
    const webViewLink = ref<string | null>(null)
    const webContentLink = ref<string | null>(null)
    const fileId = ref<string | null>(null)

    const googleDriveMapRepository = new GoogleDriveMapRepository()

    const getAllFolders = async () => {
        const { data } = await googleDriveMapRepository.findAll()
        if (!data) return null
        return data
    }

    const getFolderByName = async (folderName: string) => {
        const { data } = await googleDriveMapRepository.findByFolderName(folderName)
        if (!data) return null
        return data
    }

    // 核心上傳邏輯，將 File 物件作為參數傳入
    const upload = async (folderId: string, file: File) => {
        if (!file) {
            error.value = '請提供有效的檔案'
            return
        }

        // 初始化狀態
        isUploading.value = true
        progress.value = 0
        result.value = null
        error.value = null
        webViewLink.value = null
        webContentLink.value = null
        fileId.value = null

        try {
            // 步驟 1：向 Nuxt Server 申請續傳網址
            progress.value = 10

            const { uploadUrl } = await $fetch('/api/googleDrive/getUploadUrl', {
                method: 'POST',
                body: {
                    folderId,
                    fileName: file.name,
                    mimeType: file.type
                }
            })

            // 步驟 2：前端直傳 Google 伺服器
            progress.value = 30
            const googleResponse = await fetch(uploadUrl, {
                method: 'PUT',
                body: file
            })

            if (!googleResponse.ok) {
                const errorText = await googleResponse.text()
                throw new Error(`上傳失敗 (${googleResponse.status}): ${errorText}`)
            }

            progress.value = 80
            const fileData = await googleResponse.json()

            // 步驟 3：呼叫 Nuxt Server 開放權限
            progress.value = 90
            const links = await $fetch('/api/googleDrive/setPermission', {
                method: 'POST',
                body: { fileId: fileData.id }
            })

            if (!links.success) {
                throw new Error('權限設定失敗')
            }

            webViewLink.value = links.webViewLink ?? null
            webContentLink.value = links.webContentLink ?? null
            fileId.value = fileData.id

            progress.value = 100
            result.value = fileData

            return fileData // 讓呼叫端也可以直接拿到回傳值
        } catch (err: unknown) {
            // console.error('useDriveUpload 錯誤:', err)
            error.value = err instanceof Error ? err.message : '上傳過程中發生未知錯誤'
            throw err // 將錯誤往外拋，讓 UI 層決定如何提示使用者
        } finally {
            isUploading.value = false
        }
    }

    // 新增刪除方法
    const deleteFile = async (fileId: string) => {
        if (!fileId) return

        isDeleting.value = true
        error.value = null

        try {
            const response = await $fetch<{ message: string }>(
                `/api/googleDrive/delete/${fileId}`,
                {
                    method: 'DELETE'
                }
            )

            // 刪除成功後，順便清空當前的上傳結果狀態
            if (result.value?.id === fileId) {
                result.value = null
            }

            return response.message
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            if (err.response?.status === 404) {
                // 如果遇到 404，當作已成功刪除來處理
                if (result.value?.id === fileId) result.value = null
                return '檔案似乎已經不存在了'
            }

            error.value = err.data?.message || '刪除時發生未知錯誤'
            throw err
        } finally {
            isDeleting.value = false
        }
    }

    // 下載檔案
    const download = async (fileId: string) => {
        if (!fileId) return

        const url = `/api/googleDrive/download/${fileId}`
        window.open(url, '_blank')
    }

    // 處理圖片預覽
    const handlePreview = (file: File | null) => {
        if (file && file.type.startsWith('image/')) {
            if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
            previewUrl.value = URL.createObjectURL(file)
        } else {
            clearPreview()
        }
    }

    // 清除預覽與記憶體
    const clearPreview = () => {
        if (previewUrl.value) {
            URL.revokeObjectURL(previewUrl.value)
            previewUrl.value = null
        }
    }

    onUnmounted(() => {
        clearPreview()
    })

    // 暴露狀態與方法給元件使用
    return {
        isUploading,
        isDeleting,
        progress,
        result,
        error,
        upload,
        previewUrl,
        handlePreview,
        clearPreview,
        webViewLink,
        webContentLink,
        fileId,
        download,
        getAllFolders,
        getFolderByName,
        deleteFile
    }
}
