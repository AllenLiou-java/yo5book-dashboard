<template>
    <div style="padding: 20px">
        <h2>Google Drive 大檔直傳 (Composable 封裝版)</h2>

        <input type="file" @change="onFileSelect" />
        <UButton :disabled="!selectedFile || isUploading" @click="handleUpload">
            {{ isUploading ? `上傳中... ${progress}%` : '開始直傳' }}
        </UButton>

        <!-- 圖片預覽區塊 -->
        <div v-if="previewUrl" style="margin-top: 15px">
            <p style="margin-bottom: 8px; font-size: 14px; color: #666">即將上傳的圖片預覽：</p>
            <img
                :src="previewUrl"
                alt="預覽圖片"
                style="
                    max-width: 300px;
                    max-height: 300px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                "
            />
        </div>

        <div v-if="error" style="margin-top: 15px; color: red">
            <p>❌ {{ error }}</p>
        </div>

        <div v-if="result" style="margin-top: 15px; color: green">
            <p>✅ 上傳成功！檔案 ID：{{ result.id }}</p>
            <p>webViewLink:{{ webViewLink }}</p>
            <p>webContentLink:{{ webContentLink }}</p>

            <img :src="`/api/googleDrive/download/${result.id}`" alt="testImg" />

            <UButton
                color="primary"
                variant="soft"
                icon="i-heroicons-arrow-down-tray"
                style="margin-top: 10px"
                @click="downloadFile(result.id)"
            >
                下載此檔案
            </UButton>
        </div>

        <!-- 檔案下載區塊 -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eaeaea">
            <h2>Google Drive 檔案下載</h2>
            <div style="display: flex; gap: 10px; align-items: center; margin-top: 15px">
                <UInput
                    v-model="downloadId"
                    placeholder="請輸入 Google Drive 檔案 ID"
                    style="width: 300px"
                />
                <UButton
                    :disabled="!downloadId"
                    icon="i-heroicons-arrow-down-tray"
                    @click="downloadFile(downloadId)"
                >
                    下載檔案
                </UButton>
            </div>
        </div>

        <UButton @click="test">test</UButton>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const selectedFile = ref(null)
const downloadId = ref('')

// 取出 Composable 提供的狀態與方法
const {
    isUploading,
    progress,
    result,
    error,
    upload,
    previewUrl,
    handlePreview,
    webViewLink,
    webContentLink,
    download,
    getAllFolders,
    getFolderByName
} = useGoogleDrive()

const onFileSelect = (event) => {
    const file = event.target.files[0]
    selectedFile.value = file

    // 委託 Composable 處理圖片預覽
    handlePreview(file)
}

const handleUpload = async () => {
    if (!selectedFile.value) return

    try {
        const folderInfo = await getFolderByName('eventPhoto')
        if (!folderInfo) return

        const folderId = folderInfo.id

        // 呼叫 Composable 的 upload 方法並傳入檔案
        await upload(folderId, selectedFile.value)

        // 如果需要的話，可以在這裡加上 alert('上傳成功') 或清空 input 的邏輯
        // selectedFile.value = null
    } catch {
        // 錯誤已經被 Composable 內的 error 狀態接住了，這裡可以選擇靜默處理
        // 或觸發 UI 組件庫的 Toast (例如 Element Plus 的 ElMessage)
        console.log('上傳失敗')
    }
}

const downloadFile = (fileId) => {
    download(fileId)
}

const test = async () => {
    const data0 = await getFolderByName('eventPhoto').id
    const data1 = await getAllFolders()

    // const targetList = ['erratum', 'eventPhoto', 'member', 'product']
    // targetList.forEach((target) => {
    //     console.log(data[target])
    // })
    console.log(data0)

    console.log(data1)
}
</script>
