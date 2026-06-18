export default defineNuxtPlugin((nuxtApp) => {
    const isLoading = useLoading()

    /**
     * 檢查頁面上所有圖片是否載入完成的輔助函式
     * @param timeout 最大等待時間（毫秒），預設 5 秒。超過此時間不管圖片有沒有載完都會強制關閉 Loading
     */
    const waitForImages = (timeout: number = 5000): Promise<void> => {
        return new Promise((resolve) => {
            // 稍微延遲 50ms，確保 Vue 已經把 <img> 標籤真正渲染到 DOM 上
            setTimeout(() => {
                const images = Array.from(document.images) // 抓取畫面上所有的 <img>

                // 建立所有圖片的載入 Promise
                const promises = images.map((img) => {
                    // 如果圖片已經載入完成（或是從快取讀取），直接回傳成功
                    if (img.complete) return Promise.resolve()

                    return new Promise((res) => {
                        img.onload = res // 載入成功
                        img.onerror = res // 載入失敗也視為完成，避免卡死
                    })
                })

                // 使用 Promise.race 來比較「所有圖片載入完成」與「超時機制」誰先發生
                Promise.race([
                    Promise.all(promises),
                    new Promise((res) => setTimeout(res, timeout))
                ]).then(() => {
                    resolve()
                })
            }, 50)
        })
    }

    // 1. 初次載入
    nuxtApp.hook('app:mounted', async () => {
        await waitForImages() // 等待圖片載入
        isLoading.value = false
    })

    // 2. 路由導航開始
    nuxtApp.hook('page:start', () => {
        isLoading.value = true
    })

    // 3. 路由導航結束
    nuxtApp.hook('page:finish', async () => {
        // 換頁時，等待新頁面的圖片載入
        await waitForImages()
        isLoading.value = false
    })
})
