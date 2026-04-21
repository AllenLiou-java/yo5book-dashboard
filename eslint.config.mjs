// eslint.config.mjs
import withNuxt from './.nuxt/eslint.config.mjs'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

export default withNuxt([
    // 引入 Prettier 的推薦設定，它會自動關閉可能與 Prettier 衝突的 ESLint 格式化規則
    eslintPluginPrettierRecommended,

    // 你可以在這裡加入其他的自訂 ESLint 規則
    {
        rules: {
            'vue/multi-word-component-names': 0,
            'vue/singleline-html-element-content-newline': 'off',
            'vue/multiline-html-element-content-newline': 'off',
            'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
            'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
            'no-undef': 'off',
            'prettier/prettier': 'error'
        }
    }
])
