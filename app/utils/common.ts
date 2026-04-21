function getTodayLocalDate(): string {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}/${month}/${day}`
}

/**
 * 將格式為 "YYYY/MM/DD" 或 "YYYY-MM-DD" 的字串轉換為 Date 物件
 * @param dateStr - 日期字串 (例如: "2025/10/30")
 * @returns Date 物件
 */
function parseLocalDate(dateStr: string): Date {
    const dateArr = dateStr.split(/[/-]/).map(Number)

    const [year, month, day] = dateArr as [number, number, number]
    return new Date(year, month - 1, day)
}

/**
 * 傳入到期日，以當日為基點，判斷時否超過到期日
 * @param expiredDate - 傳入到期日 (例如: "2025/10/30")
 * @returns Boolean
 */
export const hasExpired = (expiredDate: string): boolean => {
    const today = parseLocalDate(getTodayLocalDate())
    const closeDay = parseLocalDate(expiredDate)
    return today > closeDay
}

export const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000)

    const formatted = date.toISOString().split('T')[0]

    return formatted
}
