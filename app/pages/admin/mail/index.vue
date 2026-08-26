<template>
    <UContainer :ui="{ base: 'max-w-full' }">
        <UCard>
            <template #header>
                <div class="flex items-center justify-between gap-4">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
                            信件活動總覽
                        </h2>

                        <p class="mt-1 text-sm text-gray-500">列出所有已執行的群發活動紀錄</p>
                    </div>

                    <UButton
                        icon="i-lucide-refresh-cw"
                        variant="outline"
                        size="lg"
                        :loading="status === 'pending'"
                        label="重新整理"
                        @click="refresh()"
                    >
                    </UButton>
                </div>
            </template>

            <!-- 載入中 -->
            <div v-if="status === 'pending'" class="flex justify-center py-12">
                <UIcon name="i-lucide-loader-circle" class="text-primary animate-spin text-4xl" />
            </div>

            <!-- 錯誤 -->
            <UAlert
                v-else-if="error"
                title="載入失敗"
                :description="error.message || '無法取得活動清單，請稍後再試。'"
                color="error"
                icon="i-heroicons-x-circle"
                variant="subtle"
            />

            <!-- 空資料 -->
            <div
                v-else-if="rows.length === 0"
                class="py-12 text-center text-sm text-gray-400 dark:text-gray-500"
            >
                尚無任何信件活動紀錄
            </div>

            <div v-else class="table-container">
                <!-- 表格 -->
                <UTable
                    :data="rows"
                    :columns="columns"
                    :ui="{
                        th: 'table-th',
                        tr: 'table-tr'
                    }"
                >
                    <template #actions-cell="{ row }">
                        <CommonTooltip text="點擊前往">
                            <UButton
                                :to="`/admin/mail/${row.original.mailId}`"
                                icon="i-lucide-table-of-contents"
                                variant="ghost"
                            ></UButton>
                        </CommonTooltip>
                    </template>
                </UTable>
            </div>
        </UCard>
    </UContainer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { CAMPAIGN_TYPE_OPTIONS, ID_TYPE_OPTIONS, ORG_TYPE_OPTIONS } from '#shared/constants/mail'

import { parseCampaignId } from '#shared/utils/campaign'

// ─── API ──────────────────────────────────────────────────────────────
const { data, status, error, refresh } = await useFetch('/api/mail/campaigns/list')

// ─── 輔助函式 ──────────────────────────────────────────────────────────

/**
 * 將 YYYYMMDD 格式轉為 YYYY/MM/DD
 */
function formatDate(raw: string): string {
    return `${raw.slice(0, 4)}/${raw.slice(4, 6)}/${raw.slice(6, 8)}`
}

/**
 * 從 options 陣列找出對應 label，找不到時直接回傳原始 value
 */
function labelOf(options: { label: string; value: string }[], value: string): string {
    return options.find((o) => o.value === value)?.label ?? value
}

// ─── 資料轉換 ──────────────────────────────────────────────────────────
const rows = computed(() => {
    const keys = data.value?.keys ?? []

    return keys
        .map((key, index) => {
            const parsed = parseCampaignId(key)

            if (!parsed) return null

            return {
                index: index + 1,
                date: formatDate(parsed.date),
                campaignType: labelOf(CAMPAIGN_TYPE_OPTIONS, parsed.campaignType),
                idType: labelOf(ID_TYPE_OPTIONS, parsed.idType),
                orgType: labelOf(ORG_TYPE_OPTIONS, parsed.orgType),
                mailId: key
            }
        })
        .filter((row) => row !== null)
})

// ─── 欄位定義 ──────────────────────────────────────────────────────────
const columns = [
    {
        accessorKey: 'index',
        header: '項次',
        meta: { class: { th: 'text-center', td: 'text-center w-16' } }
    },
    { accessorKey: 'date', header: '發送日期' },
    { accessorKey: 'campaignType', header: '活動類型' },
    { accessorKey: 'idType', header: '身分類型' },
    { accessorKey: 'orgType', header: '組織類型' },
    {
        accessorKey: 'actions',
        id: 'actions',
        header: '訂單列表',
        meta: { class: { th: 'text-center', td: 'text-center' } }
    }
]
</script>
