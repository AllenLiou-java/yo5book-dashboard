<template>
    <UContainer class="max-w-2xl py-12">
        <UCard>
            <template #header>
                <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    群發 Email 系統 (分批發送版)
                </h2>
                <p class="mt-1 text-sm text-gray-500">
                    系統會自動將名單分批處理，以避免連線逾時。寄送期間請勿關閉網頁。
                </p>
            </template>

            <form class="space-y-6" @submit.prevent="sendEmails">
                <UFormField label="活動類型" required>
                    <UInputMenu v-model="campaignType" :items="campaignTypeOptions" />
                </UFormField>
                <UFormField label="身分類型" required>
                    <UInputMenu v-model="idType" :items="idTypeOptions" />
                </UFormField>
                <UFormField label="組織類型" required>
                    <UInputMenu v-model="orgType" :items="orgTypeOptions" />
                </UFormField>

                <!-- HTML 檔案上傳 -->
                <UFormField label="1. 上傳 HTML 信件內容 (支援 {{name}}、{{email}} 變數)" required>
                    <UInput
                        type="file"
                        accept=".html"
                        icon="i-heroicons-document-text"
                        :disabled="loading"
                        @change="onHtmlChange"
                    />
                </UFormField>

                <!-- JSON 檔案上傳 -->
                <UFormField label="2. 上傳收件人清單 (JSON 格式)" required>
                    <UInput
                        type="file"
                        accept=".json"
                        icon="i-heroicons-users"
                        :disabled="loading"
                        @change="onJsonChange"
                    />
                    <template #hint>
                        格式範例：[{"email": "a@test.com", "name": "王小明"}]
                    </template>
                </UFormField>

                <!-- 發送進度顯示區 -->
                <div v-if="loading || progress.total > 0" class="space-y-2">
                    <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>寄送進度：{{ progress.current }} / {{ progress.total }}</span>
                        <span
                            >{{ Math.round((progress.current / progress.total) * 100) || 0 }}%</span
                        >
                    </div>
                    <!-- 若您的 Nuxt UI 版本支援 UProgress，可開啟下方註解使用 -->
                    <!-- <UProgress :value="progress.current" :max="progress.total" /> -->
                </div>

                <!-- 提交按鈕 -->
                <UButton
                    type="submit"
                    color="primary"
                    size="lg"
                    block
                    :loading="loading"
                    :disabled="!isFormValid || loading"
                >
                    {{ loading ? '分批寄送中...' : '開始寄送' }}
                </UButton>
            </form>

            <!-- 狀態訊息回饋 -->
            <template v-if="alert.show" #footer>
                <UAlert
                    :title="alert.title"
                    :description="alert.message"
                    :color="alert.color"
                    :icon="alert.icon"
                    variant="subtle"
                />
            </template>
        </UCard>
    </UContainer>
</template>

<script setup>
import { ref, computed } from 'vue'

const htmlFile = ref(null)
const parsedJson = ref([])
const loading = ref(false)

const campaignTypeOptions = ref([
    { label: '新書上市', value: 'NB' },
    { label: '優惠活動', value: 'PR' },
    { label: '團購活動', value: 'GB' }
])

const idTypeOptions = ref([
    { label: '會計師', value: 'CPA' },
    { label: '記帳士相關', value: 'CPB' },
    { label: '其他', value: 'OTHER' }
])

const orgTypeOptions = ref([
    { label: '個人事務所', value: 'Firm' },
    { label: '公會團體', value: 'Assn' }
])

const campaignType = ref(campaignTypeOptions.value[0])
const idType = ref(idTypeOptions.value[0])
const orgType = ref(orgTypeOptions.value[0])

// 進度與提示狀態
const progress = ref({ current: 0, total: 0 })
const alert = ref({ show: false, title: '', message: '', color: 'gray', icon: '' })

// 檢查是否已備妥 HTML 檔案且 JSON 名單內有資料
const isFormValid = computed(() => htmlFile.value && parsedJson.value.length > 0)

const onHtmlChange = (e) => {
    htmlFile.value = e.target.files[0]
}

// 讀取 JSON 檔案並在前端直接解析為 Array
const onJsonChange = (e) => {
    const file = e.target.files[0]
    if (!file) {
        parsedJson.value = []
        return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
        try {
            parsedJson.value = JSON.parse(event.target.result)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            alert.value = {
                show: true,
                title: 'JSON 格式錯誤',
                message: '請確保上傳的檔案是標準的 JSON 陣列格式。',
                color: 'error',
                icon: 'i-heroicons-x-circle'
            }
            parsedJson.value = []
        }
    }
    reader.readAsText(file)
}

const sendEmails = async () => {
    if (!isFormValid.value) return

    loading.value = true
    const totalItems = parsedJson.value.length
    const batchSize = 25 // 每批處理 50 筆
    progress.value = { current: 0, total: totalItems }

    let totalSuccess = 0
    let totalFailed = 0

    alert.value = {
        show: true,
        title: '系統運作中',
        message: '正在分批寄送信件，請勿關閉或重新整理網頁...',
        color: 'blue',
        icon: 'i-heroicons-arrow-path'
    }

    // 將大陣列切割並分批呼叫 API
    for (let i = 0; i < totalItems; i += batchSize) {
        const batch = parsedJson.value.slice(i, i + batchSize)
        const formData = new FormData()

        // HTML 檔保持原本的上傳檔案
        formData.append('html', htmlFile.value)
        // 收件人清單只傳遞這「25人」的 JSON 字串
        formData.append('recipients', JSON.stringify(batch))

        formData.append('campaignType', campaignType.value.value)
        formData.append('idType', idType.value.value)
        formData.append('orgType', orgType.value.value)

        try {
            const res = await $fetch('/api/mail/send-bulk-email', {
                method: 'POST',
                body: formData
            })

            totalSuccess += res.successCount
            totalFailed += res.failedCount
            progress.value.current += batch.length

            // 批次與批次之間，讓前端暫停 5 秒，避免後端被 SMTP 伺服器判定為機器人攻擊
            if (progress.value.current < totalItems) {
                await new Promise((resolve) => setTimeout(resolve, 5000))
            }
        } catch (error) {
            alert.value = {
                show: true,
                title: '部分批次發生錯誤',
                message: error.data?.message || error.message,
                color: 'error',
                icon: 'i-heroicons-x-circle'
            }
            // 可以選擇在這裡 break 中斷後續批次，或讓它繼續跑
        }
    }

    loading.value = false
    const isAllSuccess = totalFailed === 0

    alert.value = {
        show: true,
        title: isAllSuccess ? '全數寄送完成' : '寄送完成 (含部分失敗)',
        message: `共成功: ${totalSuccess} 封, 失敗: ${totalFailed} 封。`,
        color: isAllSuccess ? 'success' : 'warning',
        icon: isAllSuccess ? 'i-heroicons-check-circle' : 'i-heroicons-exclamation-triangle'
    }
}
</script>
