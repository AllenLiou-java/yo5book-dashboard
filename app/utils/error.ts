/**
 * 統一處理並取得錯誤訊息的輔助函式
 * 支援解析 Nuxt $fetch (Nitro API) 回傳的錯誤格式，以及標準的 JavaScript Error 物件
 *
 * @param err - 捕捉到的錯誤物件 (通常來自 catch 區塊的 unknown)
 * @param defaultMessage - 若無法解析出明確錯誤訊息時的預設字串
 * @returns 最終解析出的錯誤訊息字串
 */
export const getErrorMessage = (err: unknown, defaultMessage: string): string => {
    // 嘗試將錯誤斷言為包含 API 回應資料的結構 ($fetch 拋出的錯誤特徵)
    const fetchError = err as { data?: { message?: string; statusMessage?: string } }

    // 優先取得 API 回傳的錯誤訊息 (message) 或狀態訊息 (statusMessage)
    const serverMsg = fetchError.data?.message || fetchError.data?.statusMessage

    // 若無 API 錯誤訊息，判斷是否為一般 Error 實例並取其 message，最後才使用預設訊息
    return serverMsg || (err instanceof Error ? err.message : defaultMessage)
}
