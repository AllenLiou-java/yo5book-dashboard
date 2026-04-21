<template>
    <!-- <div
        class="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100"
    >
        <div class="flex h-screen">
            <AppSidebar2 />

            <div class="grow overflow-hidden">
                <AppHeader />

                <div class="overflow-y-auto">
                    <slot />
                </div>
            </div>
        </div>
    </div> -->
    <div class="flex flex-1">
        <USidebar
            v-model:open="open"
            collapsible="icon"
            rail
            :ui="{
                container: 'h-full',
                inner: 'bg-elevated/25 divide-transparent',
                body: 'py-0'
            }"
        >
            <template #header>
                <div class="flex flex-1 items-center justify-between">
                    <div class="flex items-center gap-4">
                        <NuxtImg
                            alt="yooooobook logo"
                            class="inset-0 object-cover"
                            src="/images/logo.png"
                            format="webp"
                            quality="50"
                            loading="lazy"
                            placeholder
                            width="32"
                            height="32"
                        />
                        <span class="text-2xl font-bold tracking-tight">Yooooobook</span>
                    </div>
                    <UButton
                        icon="i-lucide-x"
                        size="sm"
                        variant="solid"
                        class="rounded-full lg:hidden"
                        @click="toggleSidebar"
                    />
                </div>
            </template>

            <template #default="{ state }">
                <UNavigationMenu
                    :key="state"
                    :items="getItems(state)"
                    orientation="vertical"
                    :ui="{ link: 'p-3 overflow-hidden' }"
                />
            </template>

            <template #footer>
                <UDropdownMenu
                    :items="userItems"
                    :content="{ align: 'center', collisionPadding: 12 }"
                    :ui="{ content: 'w-(--reka-dropdown-menu-trigger-width) min-w-48' }"
                >
                    <UButton
                        v-bind="user"
                        :label="user?.name"
                        trailing-icon="i-lucide-chevrons-up-down"
                        color="neutral"
                        variant="ghost"
                        square
                        class="data-[state=open]:bg-elevated w-full overflow-hidden"
                        :ui="{
                            trailingIcon: 'text-dimmed ms-auto'
                        }"
                    />
                </UDropdownMenu>
            </template>
        </USidebar>

        <div class="flex flex-1 flex-col">
            <div
                class="border-default flex h-(--ui-header-height) shrink-0 items-center border-b px-4"
            >
                <UButton
                    icon="i-lucide-panel-left"
                    color="neutral"
                    variant="ghost"
                    aria-label="Toggle sidebar"
                    @click="toggleSidebar"
                />
            </div>

            <div class="flex-1">
                <slot />
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { LazyModalBasic } from '#components'
import type { DropdownMenuItem, NavigationMenuItem } from '@nuxt/ui'

const open = ref(true)

const colorMode = useColorMode()

function getItems(state: 'collapsed' | 'expanded') {
    return [
        {
            label: '控制台',
            icon: 'i-lucide-layout-dashboard',
            to: '/admin/dashboard'
        },
        {
            label: '團購管理',
            icon: 'i-lucide-shopping-bag',
            defaultOpen: true,
            children:
                state === 'expanded'
                    ? [
                          {
                              label: '新增團購',
                              icon: 'i-lucide-circle-plus',
                              to: '/admin/groupBuying/create'
                          },
                          {
                              label: '團購列表',
                              icon: 'i-lucide-users',
                              to: '/admin/groupBuying'
                          }
                      ]
                    : []
        },
        {
            label: '訂單管理',
            icon: 'i-lucide-list-ordered',
            defaultOpen: true,
            children:
                state === 'expanded'
                    ? [
                          {
                              label: '團購訂單',
                              icon: 'i-lucide-users',
                              to: '/admin/orders/group'
                          },
                          {
                              label: '個人訂單',
                              icon: 'i-lucide-user',
                              to: '/admin/orders/personal'
                          }
                      ]
                    : []
        },
        {
            label: '存貨管理',
            icon: 'i-lucide-notebook-pen',
            to: '/admin/inventory'
        },
        {
            label: '業務管理',
            icon: 'i-lucide-briefcase',
            defaultOpen: true,
            children:
                state === 'expanded'
                    ? [
                          {
                              label: '客戶管理',
                              icon: 'i-lucide-user',
                              to: '/admin/customers'
                          }
                      ]
                    : []
        },
        {
            label: '設定',
            icon: 'i-lucide-settings',
            defaultOpen: true,
            children:
                state === 'expanded'
                    ? [
                          {
                              label: 'General',
                              icon: 'i-lucide-house'
                          }
                      ]
                    : []
        }
    ] satisfies NavigationMenuItem[]
}

const user = ref({
    name: 'User'
    // avatar: {
    //     src: 'https://github.com/benjamincanac.png',
    //     alt: 'Benjamin Canac'
    // }
})

const toast = useToast()
const overlay = useOverlay()
const modal = overlay.create(LazyModalBasic)

const userItems = computed<DropdownMenuItem[][]>(() => [
    [
        {
            label: '個人資料',
            icon: 'i-lucide-user'
        },
        {
            label: '設定',
            icon: 'i-lucide-settings',
            to: '/admin/settings'
        }
    ],
    [
        {
            label: '外觀',
            icon: 'i-lucide-sun-moon',
            children: [
                {
                    label: 'Light',
                    icon: 'i-lucide-sun',
                    type: 'checkbox',
                    checked: colorMode.value === 'light',
                    onUpdateChecked(checked: boolean) {
                        if (checked) {
                            colorMode.preference = 'light'
                        }
                    },
                    onSelect(e: Event) {
                        e.preventDefault()
                    }
                },
                {
                    label: 'Dark',
                    icon: 'i-lucide-moon',
                    type: 'checkbox',
                    checked: colorMode.value === 'dark',
                    onUpdateChecked(checked: boolean) {
                        if (checked) {
                            colorMode.preference = 'dark'
                        }
                    },
                    onSelect(e: Event) {
                        e.preventDefault()
                    }
                }
            ]
        }
    ],
    [
        {
            label: '登出',
            icon: 'i-lucide-log-out',
            async onSelect(e: Event) {
                const instance = modal.open({
                    title: '確定要登出嗎？',
                    submitLabel: '確定登出',
                    cancelLabel: '取消'
                })

                const shouldIncrement = await instance.result

                if (shouldIncrement) {
                    e.preventDefault()
                    useAuthStore().logout()
                    toast.add({
                        title: '登出成功',
                        color: 'success',
                        id: 'modal-success'
                    })
                    return
                }
            }
        }
    ]
])

const toggleSidebar = () => {
    ;(document.activeElement as HTMLElement)?.blur()
    open.value = !open.value
}
</script>
