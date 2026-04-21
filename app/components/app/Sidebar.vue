<template>
    <aside class="bg-primary flex w-64 shrink-0 flex-col text-white">
        <div class="flex flex-col gap-1 border-b border-white/10 p-6">
            <h1 class="text-xl font-bold tracking-tight">ERP 後台管理</h1>
            <p class="text-xs font-semibold tracking-widest text-white/60 uppercase">管理系統</p>
        </div>

        <nav class="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
            <template v-for="(item, index) in menuConfig" :key="index">
                <div
                    v-if="item.type === 'label'"
                    :class="[
                        'px-4 text-[10px] font-bold tracking-widest text-white/40 uppercase',
                        item.marginTop ? item.marginTop : 'mt-4 mb-1'
                    ]"
                >
                    {{ item.text }}
                </div>

                <NuxtLink
                    v-else
                    :to="item.to"
                    class="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-white/10"
                    active-class="bg-white/20"
                >
                    <span class="material-symbols-outlined">{{ item.icon }}</span>
                    <span class="text-sm font-medium">{{ item.text }}</span>
                </NuxtLink>
            </template>

            <div class="mt-auto">
                <NuxtLink
                    to="/admin"
                    class="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-white/10"
                    active-class="bg-white/20"
                >
                    <span class="material-symbols-outlined">settings</span>
                    <span class="text-sm font-medium">系統設定</span>
                </NuxtLink>
            </div>
        </nav>
    </aside>
</template>

<script setup lang="ts">
// 定義選單結構類型
interface MenuItem {
    type?: 'label' | 'link'
    text: string
    icon?: string
    to?: string
    marginTop?: string // 允許自定義間距
}

// 選單資料配置
const menuConfig: MenuItem[] = [
    { text: '控制台', icon: 'dashboard', to: '/admin/dashboard' },
    { type: 'label', text: '團購相關', marginTop: 'mt-2 mb-1' },
    { text: '新增團購', icon: 'add_circle', to: '/admin/groupBuying/create' },
    { text: '團購列表', icon: 'group_work', to: '/admin/groupBuying' },
    { type: 'label', text: '業務管理' },
    { text: '訂單管理', icon: 'shopping_cart', to: '/admin/orders' },
    { text: '客戶管理', icon: 'person', to: '/admin/customers' }
]
</script>
