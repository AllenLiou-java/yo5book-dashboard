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

            <form class="space-y-6" @submit.prevent="handleSendEmails">
                <!-- 活動類型 -->
                <UFormField label="活動類型" required>
                    <UInputMenu
                        v-model="campaignType"
                        :items="CAMPAIGN_TYPE_OPTIONS"
                        value-key="value"
                    />
                </UFormField>

                <!-- 身分類型 -->
                <UFormField label="身分類型" required>
                    <UInputMenu v-model="idType" :items="ID_TYPE_OPTIONS" value-key="value" />
                </UFormField>

                <!-- 組織類型 -->
                <UFormField label="組織類型" required>
                    <UInputMenu v-model="orgType" :items="ORG_TYPE_OPTIONS" value-key="value" />
                </UFormField>

                <!-- HTML -->
                <UFormField label="1. 上傳 HTML 信件內容 (支援 {{name}}、{{email}} 變數)" required>
                    <UInput
                        type="file"
                        accept=".html"
                        icon="i-heroicons-document-text"
                        :disabled="loading"
                        @change="onHtmlChange"
                    />
                </UFormField>

                <!-- JSON -->
                <UFormField label="2. 上傳收件人清單 (JSON 格式)" required>
                    <UInput
                        type="file"
                        accept=".json"
                        icon="i-heroicons-users"
                        :disabled="loading"
                        @change="onJsonChange"
                    />

                    <template #hint>
                        格式範例： [{"email": "a@test.com", "name": "王小明"}]
                    </template>
                </UFormField>

                <!-- 主旨列表 -->
                <UFormField label="3. 郵件主旨列表 (系統會隨機抽選寄出)" required>
                    <div class="space-y-2">
                        <div
                            v-for="(_, index) in subjects"
                            :key="index"
                            class="flex items-center gap-2"
                        >
                            <UInput
                                v-model="subjects[index]"
                                class="flex-1"
                                placeholder="請輸入郵件主旨"
                                :disabled="loading"
                            />

                            <UButton
                                icon="i-heroicons-trash"
                                color="error"
                                variant="ghost"
                                size="sm"
                                :disabled="subjects.length <= 1 || loading"
                                aria-label="刪除此主旨"
                                @click="removeSubject(index)"
                            />
                        </div>

                        <UButton
                            icon="i-heroicons-plus"
                            variant="outline"
                            size="sm"
                            :disabled="loading"
                            @click="addSubject"
                        >
                            新增主旨
                        </UButton>
                    </div>

                    <template #hint> 至少填寫 1 筆；系統會從清單中隨機抽選一筆作為主旨 </template>
                </UFormField>

                <!-- 進度 -->
                <div v-if="loading || progress.total > 0" class="space-y-2">
                    <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>
                            寄送進度：
                            {{ progress.current }} /
                            {{ progress.total }}
                        </span>

                        <span>
                            {{ Math.round((progress.current / progress.total) * 100) || 0 }}%
                        </span>
                    </div>
                </div>

                <!-- 提交 -->
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

            <!-- 狀態 -->
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

<script setup lang="ts">
import { computed, ref } from 'vue'

import {
    CAMPAIGN_TYPE_OPTIONS,
    ID_TYPE_OPTIONS,
    ORG_TYPE_OPTIONS,
    CAMPAIGN_TYPE,
    ID_TYPE,
    ORG_TYPE
} from '#shared/constants/mail'

const { loading, progress, parseJsonFile, sendEmails } = useBulkEmail()

const htmlFile = ref<File | null>(null)

const recipients = ref<
    Array<{
        email: string
        name?: string
        [key: string]: unknown
    }>
>([])

const campaignType = ref(CAMPAIGN_TYPE.NEW_BOOK)
const idType = ref(ID_TYPE.CPA)
const orgType = ref(ORG_TYPE.FIRM)

/** 郵件主旨列表，至少保留 1 筆 */
const subjects = ref<string[]>([''])

const addSubject = () => {
    subjects.value.push('')
}

const removeSubject = (index: number) => {
    if (subjects.value.length > 1) {
        subjects.value.splice(index, 1)
    }
}

const alert = ref({
    show: false,
    title: '',
    message: '',
    color: 'success' as
        | 'success'
        | 'warning'
        | 'error'
        | 'info'
        | 'primary'
        | 'secondary'
        | 'neutral'
        | undefined,

    icon: ''
})

const isFormValid = computed(() => {
    const hasHtml = htmlFile.value !== null
    const hasRecipients = recipients.value.length > 0
    const hasValidSubjects = subjects.value.some((s) => s.trim() !== '')

    return hasHtml && hasRecipients && hasValidSubjects
})

/**
 * HTML 檔案
 */
const onHtmlChange = (event: Event) => {
    const input = event.target as HTMLInputElement

    htmlFile.value = input.files?.[0] ?? null
}

/**
 * JSON 檔案
 */
const onJsonChange = async (event: Event) => {
    const input = event.target as HTMLInputElement

    const file = input.files?.[0]

    if (!file) {
        recipients.value = []
        return
    }

    try {
        recipients.value = await parseJsonFile(file)

        alert.value = {
            show: false,
            title: '',
            message: '',
            color: 'success',
            icon: ''
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        recipients.value = []

        alert.value = {
            show: true,
            title: 'JSON 格式錯誤',
            message: error.message || '請確保上傳的檔案是標準的 JSON 陣列格式。',
            color: 'error',
            icon: 'i-heroicons-x-circle'
        }
    }
}

/**
 * 開始寄送
 */
const handleSendEmails = async () => {
    if (!isFormValid.value || !htmlFile.value) {
        return
    }

    alert.value = {
        show: true,
        title: '系統運作中',
        message: '正在分批寄送信件，請勿關閉或重新整理網頁...',
        color: 'primary',
        icon: 'i-heroicons-arrow-path'
    }

    try {
        const result = await sendEmails({
            htmlFile: htmlFile.value,
            recipients: recipients.value,
            campaignType: campaignType.value,
            idType: idType.value,
            orgType: orgType.value,
            subjects: subjects.value
        })

        const isAllSuccess = result.failedCount === 0

        alert.value = {
            show: true,
            title: isAllSuccess ? '全數寄送完成' : '寄送完成 (含部分失敗)',
            message: `共成功: ${result.successCount} 封, ` + `失敗: ${result.failedCount} 封。`,
            color: isAllSuccess ? 'success' : 'warning',
            icon: isAllSuccess ? 'i-heroicons-check-circle' : 'i-heroicons-exclamation-triangle'
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        alert.value = {
            show: true,
            title: '寄送失敗',
            message: error.data?.message || error.message || '寄送過程發生未知錯誤。',
            color: 'error',
            icon: 'i-heroicons-x-circle'
        }
    }
}
</script>
