/**
 * 傳入到期日，以當日為基點，判斷時否超過到期日
 * @param expiredDate - 傳入到期日 (例如: "2025/10/30")
 * @returns Boolean
 */
export const hasExpired = (expiredDate: string): boolean => {
    if (!expiredDate) return false

    // 取得 YYYY-MM-DD 格式的今天日期字串
    const today = new Date()
    const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    // 將傳入的日期統一轉為 YYYY-MM-DD 格式以利比較
    const expiredDateISO = expiredDate.replace(/\//g, '-')

    // 直接比較字串，避免 Date 物件的時區問題。
    // "2024-05-22" > "2024-05-21" -> true (已過期)
    // "2024-05-21" > "2024-05-21" -> false (當天未過期)
    return todayISO > expiredDateISO
}

/**
 * 傳入timestamp，單位可為「秒」或「毫秒」
 * @param timestamp - 時間戳記的單位為毫秒，共13位數(例如: "1776158281000")，單位為秒，共10位數(例如: "1776158281")
 * @returns YYYY-MM-DD（例如：2026-04-14）
 */

export const formatDate = (timestamp?: number) => {
    if (!timestamp) return '-'

    // 判斷傳入的 timestamp 是秒 (通常為 10 位數) 還是毫秒 (13 位數)，統一轉為毫秒
    const ms = String(timestamp).length <= 10 ? timestamp * 1000 : timestamp

    const date = new Date(ms)
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')

    return `${y}-${m}-${d}`
}

/**
 * 傳入timestamp，單位可為「秒」或「毫秒」
 * @param timestamp - 時間戳記的單位為毫秒，共13位數(例如: "1776158281000")，單位為秒，共10位數(例如: "1776158281")
 * @returns YYYY-MM-DD hh:mm（例如：2026-04-14 17:18）
 */
export const formatDateTime = (timestamp?: number) => {
    if (!timestamp) return '-'

    // 判斷傳入的 timestamp 是秒 (通常為 10 位數) 還是毫秒 (13 位數)，統一轉為毫秒
    const ms = String(timestamp).length <= 10 ? timestamp * 1000 : timestamp

    const date = new Date(ms)
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const h = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${d} ${h}:${min}`
}

/**
 * 加入千分位
 * @param value - 傳入數值
 * @returns string
 */
export const thousandthsFormat = (value: string | number) => {
    const regex = /\B(?=(\d{3})+(?!\d))/g
    value = value.toString()
    return value.replace(regex, ',')
}
