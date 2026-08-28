<template>
    <UContainer :ui="{ base: 'max-w-full' }">
        <UCard>
            <template #header>
                <div class="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
                            活動詳細紀錄
                        </h2>

                        <p class="mt-1 font-mono text-sm text-gray-400">{{ id }}</p>
                    </div>

                    <div class="flex w-full justify-center gap-4 sm:w-auto">
                        <UButton
                            icon="i-lucide-refresh-cw"
                            size="lg"
                            :loading="status === 'pending'"
                            label="重新整理"
                            @click="mailStore.refresh"
                        >
                        </UButton>
                        <UButton
                            icon="i-lucide-arrow-left"
                            variant="outline"
                            size="lg"
                            to="/admin/mail"
                            label="返回總覽"
                        >
                        </UButton>
                    </div>
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
                :description="error || '無法取得活動紀錄，請稍後再試。'"
                color="error"
                icon="i-heroicons-x-circle"
                variant="subtle"
            />

            <template v-else>
                <!-- 篩選列 -->
                <div
                    class="mb-4 grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2 lg:grid-cols-4 dark:border-gray-700 dark:bg-gray-800/50"
                >
                    <!-- Email 篩選 -->
                    <UFormField label="Email">
                        <UInput
                            v-model="filterEmail"
                            icon="i-lucide-search"
                            placeholder="輸入 Email 關鍵字"
                            :disabled="rows.length === 0"
                        />
                    </UFormField>

                    <!-- 起始時間 -->
                    <UFormField label="寄送日期（起）">
                        <UInput
                            v-model="filterDateStart"
                            type="date"
                            :disabled="rows.length === 0"
                        />
                    </UFormField>

                    <!-- 結束時間 -->
                    <UFormField label="寄送日期（迄）">
                        <UInput v-model="filterDateEnd" type="date" :disabled="rows.length === 0" />
                    </UFormField>

                    <!-- 開信狀態 -->
                    <UFormField label="開信狀態">
                        <USelectMenu
                            v-model="filterOpened"
                            :items="openedOptions"
                            value-key="value"
                            :disabled="rows.length === 0"
                        />
                    </UFormField>
                </div>

                <!-- 篩選結果摘要 + 重設 -->
                <div class="mb-3 flex items-center justify-between text-sm text-gray-500">
                    <span>
                        共
                        <span class="font-semibold text-gray-800 dark:text-gray-200">
                            {{ filteredRows.length }}
                        </span>
                        筆（總計 {{ rows.length }} 筆）
                    </span>

                    <UButton
                        v-if="isFiltered"
                        icon="i-lucide-x"
                        variant="ghost"
                        size="xs"
                        color="neutral"
                        @click="mailStore.resetFilters()"
                    >
                        清除篩選
                    </UButton>
                </div>

                <!-- 空資料 -->
                <div
                    v-if="rows.length === 0"
                    class="py-12 text-center text-sm text-gray-400 dark:text-gray-500"
                >
                    此活動尚無任何寄送紀錄
                </div>

                <!-- 篩選後無結果 -->
                <div
                    v-else-if="filteredRows.length === 0"
                    class="py-12 text-center text-sm text-gray-400 dark:text-gray-500"
                >
                    <UIcon name="i-lucide-search-x" class="mb-2 text-3xl" />
                    <p>找不到符合條件的紀錄</p>
                </div>

                <!-- 表格 -->
                <div v-else class="table-container">
                    <UTable
                        :data="filteredRows"
                        :columns="columns"
                        :ui="{
                            th: 'table-th',
                            tr: 'table-tr'
                        }"
                    >
                        <template #index-cell="{ row }">
                            <span>{{ parseInt(row.id) + 1 }}</span>
                        </template>
                        <!-- 寄送時間：格式化 timestamp -->
                        <template #sentAt-cell="{ row }">
                            <span class="text-sm text-gray-600 dark:text-gray-400">
                                {{ formatTimestamp(row.original.sentAt) }}
                            </span>
                        </template>

                        <!-- 開信狀態：UBadge -->
                        <template #opened-cell="{ row }">
                            <UBadge
                                :color="row.original.opened ? 'success' : 'neutral'"
                                :icon="row.original.opened ? 'i-lucide-mail-open' : 'i-lucide-mail'"
                                variant="subtle"
                                size="sm"
                            >
                                {{ row.original.opened ? '已開信' : '未開信' }}
                            </UBadge>
                        </template>

                        <template #openedAt-cell="{ row }">
                            <span class="text-sm text-gray-600 dark:text-gray-400">
                                {{
                                    row.original.openedAt
                                        ? formatTimestamp(row.original.openedAt)
                                        : '-'
                                }}
                            </span>
                        </template>

                        <!-- 操作 -->
                        <template #actions-cell="{ row }">
                            <div class="flex justify-center">
                                <UButton
                                    icon="i-lucide-trash-2"
                                    color="error"
                                    variant="ghost"
                                    size="xl"
                                    @click="handleDelete(row.original)"
                                />
                            </div>
                        </template>
                    </UTable>
                </div>
            </template>
        </UCard>
    </UContainer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { LazyModalBasic } from '#components'
import type { MailLog } from '~/types/mail'

// ─── 路由參數 ──────────────────────────────────────────────────────────
const route = useRoute()
const id = route.params.id as string

// ─── Store ────────────────────────────────────────────────────────────
const mailStore = useMailStore()
const {
    rows,
    isLoading,
    error,
    filteredRows,
    filterEmail,
    filterDateStart,
    filterDateEnd,
    filterOpened,
    openedOptions,
    isFiltered
} = storeToRefs(mailStore)

await mailStore.loadCampaign(id)

// ─── 輔助函式 ──────────────────────────────────────────────────────────

/**
 * Firebase Timestamp (ms) → YYYY/MM/DD HH:mm
 */
function formatTimestamp(ms: number): string {
    const d = new Date(ms)
    const yyyy = d.getFullYear()
    const MM = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const HH = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    return `${yyyy}/${MM}/${dd} ${HH}:${mm}`
}

/**
 * 刪除單筆紀錄
 */
const overlay = useOverlay()
const modal = overlay.create(LazyModalBasic)
const toastStore = useToastStore()

async function handleDelete(log: MailLog) {
    if (!log.emailKey || !log.mailId) {
        toastStore.error('無法刪除：缺少必要識別碼')
        return
    }

    const instance = modal.open({
        title: '刪除此活動',
        submitLabel: '確定刪除',
        cancelLabel: '取消'
    })
    const shouldIncrement = await instance.result

    if (!shouldIncrement) return

    try {
        await mailStore.deleteMailLog(id, log.emailKey, log.mailId)
    } catch (err: unknown) {
        toastStore.error(err instanceof Error ? err.message : '刪除失敗')
    }
}

// ─── 欄位定義 ──────────────────────────────────────────────────────────
const columns = [
    {
        accessorKey: 'index',
        header: '項次',
        meta: { class: { th: 'text-center', td: 'text-center w-16' } }
    },
    { accessorKey: 'name', header: '收件人' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'subject', header: '主旨' },
    {
        accessorKey: 'sentAt',
        header: '寄送時間',
        meta: { class: { th: 'text-center', td: 'text-center' } }
    },
    {
        accessorKey: 'opened',
        header: '開信狀態',
        meta: { class: { th: 'text-center', td: 'text-center' } }
    },
    {
        accessorKey: 'openedAt',
        header: '開信時間',
        meta: { class: { th: 'text-center', td: 'text-center' } }
    },
    {
        id: 'actions',
        header: '操作',
        meta: { class: { th: 'text-center w-24', td: 'text-center' } }
    }
]

// ─── Template 用的 computed ───────────────────────────────────────────
// status 對應 store 的 isLoading（供 template v-if 判斷）
const status = computed(() => (isLoading.value ? 'pending' : 'idle'))
</script>
