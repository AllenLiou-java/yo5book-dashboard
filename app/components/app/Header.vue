<template>
    <header
        class="dark:bg-background-dark flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8 dark:border-slate-800"
    >
        <div class="flex items-center gap-4">
            <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100">團購管理</h2>
            <div class="relative ml-4 max-w-xs">
                <span
                    class="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-sm text-slate-400"
                    >search</span
                >
                <input
                    class="focus:ring-primary/50 w-full rounded-lg border-none bg-slate-100 py-1.5 pr-4 pl-10 text-sm focus:ring-2 dark:bg-slate-800"
                    placeholder="搜尋活動..."
                    type="text"
                />
            </div>
        </div>
        <div class="flex items-center gap-3">
            <button
                class="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            >
                <span class="material-symbols-outlined">notifications</span>
                <span
                    class="dark:border-background-dark absolute top-2 right-2 h-2 w-2 rounded-full border-2 border-white bg-red-500"
                ></span>
            </button>
            <div class="mx-2 h-8 w-px bg-slate-200 dark:border-slate-700"></div>
            <div class="flex items-center gap-3 pl-2">
                <div class="hidden text-right sm:block">
                    <p class="text-xs font-bold">管理員</p>
                    <p class="text-[10px] text-slate-500 uppercase">超級管理員</p>
                </div>
                <div
                    class="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center overflow-hidden rounded-full"
                >
                    <span class="material-symbols-outlined">account_circle</span>
                </div>
            </div>
        </div>
    </header>
</template>

<script setup lang="ts"></script>

<style scoped></style>
