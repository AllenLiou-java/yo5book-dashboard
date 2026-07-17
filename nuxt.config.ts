// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    experimental: {
        serverAppConfig: false
    },

    app: {
        head: {
            link: [
                // Google Fonts: Inter
                {
                    rel: 'stylesheet',
                    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap'
                },
                // Material Symbols
                {
                    rel: 'stylesheet',
                    href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap'
                },
                {
                    rel: 'stylesheet',
                    href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@100..900&display=swap'
                }
            ],
            script: [
                {
                    src: 'https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js',
                    defer: true
                }
            ]
        }
    },
    vite: {
        optimizeDeps: {
            include: [
                '@vue/devtools-core',
                '@vue/devtools-kit',
                'zod',
                '@vee-validate/zod',
                '@tiptap/extension-text-align',
                'file-saver',
                'xlsx-js-style'
            ]
        }
    },
    css: ['~/assets/css/main.css'],

    modules: [
        '@nuxt/eslint',
        '@nuxt/ui',
        '@pinia/nuxt',
        '@nuxt/image',
        '@vueuse/nuxt',
        '@vee-validate/nuxt'
    ],

    typescript: {
        strict: true,
        typeCheck: false
    },
    runtimeConfig: {
        firebaseProjectId: '',
        firebaseClientEmail: '',
        firebasePrivateKey: '',
        firebaseApiUrl: '',
        jwtSecret: '',
        googleClientEmail: '',
        googlePrivateKey: '',
        gmailAppPassword: ''
    },
    routeRules: {
        '/': { redirect: '/login' },
        // @ts-expect-error: Vercel preset supports maxDuration but Nitro types currently miss it
        '/api/send-bulk-email': { maxDuration: 300 } // 針對群發 API 放寬時間限制，注意：Vercel Pro 的預設 Serverless 上限是 300 秒 (5分鐘)
    }
})
