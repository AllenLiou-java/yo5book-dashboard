<template>
    <UEditor
        v-slot="{ editor }"
        v-model="modelValue"
        content-type="html"
        :extensions="[TextAlign.configure({ types: ['heading', 'paragraph'] })]"
        class="editor-content flex min-h-37 w-full flex-col gap-4"
        :ui="{
            root: 'py-0'
        }"
    >
        <UEditorToolbar :editor="editor" :items="items" class="overflow-x-auto sm:px-8" />
    </UEditor>
</template>

<script setup lang="ts">
import type { EditorToolbarItem } from '@nuxt/ui'
import { TextAlign } from '@tiptap/extension-text-align'

const modelValue = defineModel<string>('value')

const items: EditorToolbarItem[][] = [
    // History controls
    [
        {
            kind: 'undo',
            icon: 'i-lucide-undo',
            tooltip: { text: 'Undo' }
        },
        {
            kind: 'redo',
            icon: 'i-lucide-redo',
            tooltip: { text: 'Redo' }
        }
    ],
    // Block types
    [
        {
            icon: 'i-lucide-heading',
            tooltip: { text: 'Headings' },
            content: {
                align: 'start'
            },
            items: [
                {
                    kind: 'heading',
                    level: 1,
                    icon: 'i-lucide-heading-1',
                    label: 'Heading 1'
                },
                {
                    kind: 'heading',
                    level: 2,
                    icon: 'i-lucide-heading-2',
                    label: 'Heading 2'
                },
                {
                    kind: 'heading',
                    level: 3,
                    icon: 'i-lucide-heading-3',
                    label: 'Heading 3'
                },
                {
                    kind: 'heading',
                    level: 4,
                    icon: 'i-lucide-heading-4',
                    label: 'Heading 4'
                }
            ]
        },
        {
            icon: 'i-lucide-list',
            tooltip: { text: 'Lists' },
            content: {
                align: 'start'
            },
            items: [
                {
                    kind: 'bulletList',
                    icon: 'i-lucide-list',
                    label: 'Bullet List'
                },
                {
                    kind: 'orderedList',
                    icon: 'i-lucide-list-ordered',
                    label: 'Ordered List'
                }
            ]
        },
        {
            kind: 'blockquote',
            icon: 'i-lucide-text-quote',
            tooltip: { text: 'Blockquote' }
        },
        {
            kind: 'codeBlock',
            icon: 'i-lucide-square-code',
            tooltip: { text: 'Code Block' }
        },
        {
            kind: 'horizontalRule',
            icon: 'i-lucide-separator-horizontal',
            tooltip: { text: 'Horizontal Rule' }
        }
    ],
    // Text formatting
    [
        {
            kind: 'mark',
            mark: 'bold',
            icon: 'i-lucide-bold',
            tooltip: { text: 'Bold' }
        },
        {
            kind: 'mark',
            mark: 'italic',
            icon: 'i-lucide-italic',
            tooltip: { text: 'Italic' }
        },
        {
            kind: 'mark',
            mark: 'underline',
            icon: 'i-lucide-underline',
            tooltip: { text: 'Underline' }
        },
        {
            kind: 'mark',
            mark: 'strike',
            icon: 'i-lucide-strikethrough',
            tooltip: { text: 'Strikethrough' }
        },
        {
            kind: 'mark',
            mark: 'code',
            icon: 'i-lucide-code',
            tooltip: { text: 'Code' }
        }
    ],
    // Link
    [
        {
            kind: 'link',
            icon: 'i-lucide-link',
            tooltip: { text: 'Link' }
        }
    ],
    // Text alignment
    [
        {
            icon: 'i-lucide-align-justify',
            tooltip: { text: 'Text Align' },
            content: {
                align: 'end'
            },
            items: [
                {
                    kind: 'textAlign',
                    align: 'left',
                    icon: 'i-lucide-align-left',
                    label: 'Align Left'
                },
                {
                    kind: 'textAlign',
                    align: 'center',
                    icon: 'i-lucide-align-center',
                    label: 'Align Center'
                },
                {
                    kind: 'textAlign',
                    align: 'right',
                    icon: 'i-lucide-align-right',
                    label: 'Align Right'
                },
                {
                    kind: 'textAlign',
                    align: 'justify',
                    icon: 'i-lucide-align-justify',
                    label: 'Align Justify'
                }
            ]
        }
    ]
]
</script>
<style scoped>
.editor-content :deep(p) {
    margin-bottom: 0;
    margin-top: 0;
}

.editor-content :deep(h1),
.editor-content :deep(h2),
.editor-content :deep(h3) {
    margin-top: 0;
    margin-bottom: 0.5em;
    font-weight: bold;
}

.editor-content :deep(ul),
.editor-content :deep(ol) {
    margin: 0;
    padding-left: 1.5rem;
}
</style>
