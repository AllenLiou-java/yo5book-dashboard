<template>
    <UForm :schema="schema" :state="state" class="w-96 space-y-4" @submit="onSubmit">
        <div v-if="currentImage" class="relative">
            <span
                class="material-symbols-outlined absolute -top-2 -right-2 cursor-pointer rounded-full border bg-black p-1 text-white"
                style="font-size: 12px"
                @click="deleteImageConfirm"
                >delete</span
            >
            <img
                :src="currentImage"
                alt="宣傳圖片"
                class="mb-4 max-h-64 rounded-lg border border-slate-200 object-contain shadow-sm dark:border-slate-700"
            />
        </div>

        <UFormField name="image" :label="label">
            <UFileUpload
                v-model="state.image"
                label="圖片變更"
                accept="image/*"
                class="min-h-48"
                description="圖片大小不超過4MB，檔案類型接受JPG, GIF or PNG."
            />
        </UFormField>

        <UButton :loading="isUploading" type="submit" label="圖片上傳" color="primary" />
    </UForm>
</template>

<script setup lang="ts">
import { LazyModalBasic } from '#components'
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const overlay = useOverlay()
const modal = overlay.create(LazyModalBasic)

const props = defineProps({
    label: {
        type: String,
        default: ''
    },
    currentImage: {
        type: String,
        default: ''
    },
    targetFolderName: {
        type: String,
        default: ''
    }
})

const emit = defineEmits({
    uploadData: null
})

const MAX_FILE_SIZE = 4 * 1024 * 1024 // 4MB
const MIN_DIMENSIONS = { width: 200, height: 200 }
const MAX_DIMENSIONS = { width: 4096, height: 4096 }
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

const schema = z.object({
    image: z
        .instanceof(File, {
            message: '請選擇有效的圖片檔案。'
        })
        .refine((file) => file.size <= MAX_FILE_SIZE, {
            message: `圖片大小超過上限，請選擇小於 ${formatBytes(MAX_FILE_SIZE)} 的圖片。`
        })
        .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
            message: '請選擇有效的圖片類型 (JPEG, PNG, or WebP)。'
        })
        .refine(
            (file) =>
                new Promise((resolve) => {
                    const reader = new FileReader()
                    reader.onload = (e) => {
                        const img = new Image()
                        img.onload = () => {
                            const meetsDimensions =
                                img.width >= MIN_DIMENSIONS.width &&
                                img.height >= MIN_DIMENSIONS.height &&
                                img.width <= MAX_DIMENSIONS.width &&
                                img.height <= MAX_DIMENSIONS.height
                            resolve(meetsDimensions)
                        }
                        img.src = e.target?.result as string
                    }
                    reader.readAsDataURL(file)
                }),
            {
                message: `圖片尺寸不符合要求。請選擇圖片寬高介於 ${MIN_DIMENSIONS.width}x${MIN_DIMENSIONS.height} 和 ${MAX_DIMENSIONS.width}x${MAX_DIMENSIONS.height} 像素之間的圖片。`
            }
        )
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
    image: undefined
})

const toastStore = useToastStore()
const { upload, deleteFile, getFolderByName, isUploading } = useGoogleDrive()

const deleteImageConfirm = async () => {
    const instance = modal.open({
        title: '確定要刪除圖片嗎？',
        submitLabel: '確定刪除',
        cancelLabel: '取消'
    })

    const isConfirmed = await instance.result

    if (isConfirmed) {
        await deleteFileFromDrive()
        emit('uploadData', '')
        toastStore.success('刪除成功')
    }
}

const deleteFileFromDrive = async () => {
    if (!props.currentImage) return

    const params = new URL(props.currentImage).searchParams
    const fileId = params.get('id')
    if (!fileId) return

    await deleteFile(fileId)
}

// 檔案上傳成功後，將舊檔案從 Google Drive 刪除
async function onSubmit(event: FormSubmitEvent<Schema>) {
    const folder = await getFolderByName('eventPhoto')
    const targetFolderId = folder?.id
    if (!targetFolderId) return

    const { id: fileId } = await upload(targetFolderId, event.data.image)
    toastStore.success('上傳成功')
    state.image = undefined
    await deleteFileFromDrive()
    emit('uploadData', fileId)
}
</script>
