import fileSaver from 'file-saver'
import type { CellStyle, WorkSheet } from 'xlsx-js-style'
import type { OrderData, OrderItem } from '~/types/order'

const { saveAs } = fileSaver

type XLSXModule = typeof import('xlsx-js-style')

type ExcelValue = string | number | boolean | Date

type ExcelRow = Record<string, ExcelValue>

type ExcelHorizontalAlign = 'left' | 'center' | 'right'

interface ExcelColumn {
    /**
     * Excel 欄位名稱
     */
    key: string

    /**
     * 最小欄寬
     */
    minWidth?: number

    /**
     * 最大欄寬
     */
    maxWidth?: number

    /**
     * 欄位水平對齊
     */
    align?: ExcelHorizontalAlign

    /**
     * Excel 數字格式
     */
    numFmt?: string

    /**
     * 是否自動換行
     */
    wrapText?: boolean
}

interface WorksheetOptions {
    /**
     * 欄位定義。
     *
     * 欄位順序、欄寬、樣式等皆由此決定。
     */
    columns: ExcelColumn[]

    /**
     * 表頭高度
     */
    headerHeight?: number

    /**
     * 一般資料列最低高度
     */
    rowHeight?: number

    /**
     * 是否啟用篩選
     */
    autoFilter?: boolean
}

/**
 * 商品明細欄位名稱
 */
const PRODUCT_DETAIL_HEADER = '訂單內容'

/**
 * ==================================================
 * 工作表欄位定義
 * ==================================================
 */

/**
 * 對帳用：
 *
 * 訂單日期
 * 訂單編號
 * 訂單內容
 * 合計
 * 收件人姓名
 * 帳號後5碼
 * 發票型式
 * 發票抬頭
 * 統一編號
 */
const RECONCILIATION_BASE_COLUMNS: ExcelColumn[] = [
    {
        key: '訂單日期',
        minWidth: 12,
        maxWidth: 15,
        align: 'center'
    },
    {
        key: '訂單編號',
        minWidth: 18,
        maxWidth: 25,
        align: 'center'
    },
    {
        key: PRODUCT_DETAIL_HEADER,
        minWidth: 40,
        maxWidth: 60,
        align: 'left',
        wrapText: true
    },
    {
        key: '合計',
        minWidth: 12,
        maxWidth: 15,
        align: 'right',
        numFmt: '#,##0'
    },
    {
        key: '收件人姓名',
        minWidth: 12,
        maxWidth: 20,
        align: 'center'
    },
    {
        key: '帳號後5碼',
        minWidth: 12,
        maxWidth: 15,
        align: 'center'
    },
    {
        key: '發票型式',
        minWidth: 10,
        maxWidth: 12,
        align: 'center'
    },
    {
        key: '發票抬頭',
        minWidth: 20,
        maxWidth: 35,
        align: 'left'
    },
    {
        key: '統一編號',
        minWidth: 13,
        maxWidth: 15,
        align: 'center'
    }
]

/**
 * 出貨用：
 *
 * 訂單日期
 * 訂單編號
 * 訂單內容
 * [商品數量欄位...]
 * 合計
 * 收件人姓名
 * 收件人電話
 * 收件地址
 * E-mail
 * 訂單狀態
 * 備註
 */
const SHIPPING_BASE_COLUMNS: ExcelColumn[] = [
    {
        key: '訂單日期',
        minWidth: 12,
        maxWidth: 15,
        align: 'center'
    },
    {
        key: '訂單編號',
        minWidth: 18,
        maxWidth: 25,
        align: 'center'
    },
    {
        key: PRODUCT_DETAIL_HEADER,
        minWidth: 40,
        maxWidth: 60,
        align: 'left',
        wrapText: true
    }
]

const SHIPPING_END_COLUMNS: ExcelColumn[] = [
    {
        key: '合計',
        minWidth: 12,
        maxWidth: 15,
        align: 'right',
        numFmt: '#,##0'
    },
    {
        key: '收件人姓名',
        minWidth: 12,
        maxWidth: 20,
        align: 'center'
    },
    {
        key: '收件人電話',
        minWidth: 14,
        maxWidth: 18,
        align: 'center'
    },
    {
        key: '收件地址',
        minWidth: 30,
        maxWidth: 50,
        align: 'left',
        wrapText: true
    },
    {
        key: 'E-mail',
        minWidth: 25,
        maxWidth: 40,
        align: 'left'
    },
    {
        key: '訂單狀態',
        minWidth: 12,
        maxWidth: 18,
        align: 'center'
    },
    {
        key: '備註',
        minWidth: 20,
        maxWidth: 40,
        align: 'left',
        wrapText: true
    }
]

/**
 * 表頭樣式
 */
const HEADER_STYLE: CellStyle = {
    font: {
        bold: true,
        name: 'Microsoft JhengHei',
        sz: 11
    },
    alignment: {
        horizontal: 'center',
        vertical: 'center',
        wrapText: true
    },
    fill: {
        patternType: 'solid',
        fgColor: {
            rgb: 'D9D9D9'
        }
    },
    border: borderStyle()
}

/**
 * ==================================================
 * Excel 匯出
 * ==================================================
 */
export async function exportOrdersExcel(orders: OrderData[]): Promise<void> {
    if (import.meta.server) {
        throw new Error('Excel 匯出功能只能在瀏覽器端執行')
    }

    if (!orders.length) {
        throw new Error('目前沒有可匯出的訂單資料')
    }

    /**
     * 動態載入 xlsx-js-style
     *
     * 避免 SSR 階段載入瀏覽器端套件。
     */
    const XLSX = await import('xlsx-js-style')

    /**
     * 不直接修改原始 orders 陣列
     */
    const ordersSorted = [...orders].sort((a, b) => (a.orderDate || 0) - (b.orderDate || 0))

    /**
     * 取得所有商品
     */
    const uniqueProducts = getUniqueProducts(ordersSorted)

    const productNames = uniqueProducts.map((product) => product.productName)

    /**
     * ==================================================
     * 工作表一：對帳用
     * ==================================================
     */

    const reconciliationData = ordersSorted.map((order) => {
        return {
            訂單日期: formatDate(order.orderDate),

            訂單編號: order.orderId || '',

            [PRODUCT_DETAIL_HEADER]: getOrderProductText(order),

            合計: toNumber(order.totalPrice),

            收件人姓名: order.receiver?.name || '',

            帳號後5碼: order.bankAccountNo || '',

            發票型式: order.taxId?.length ? '三聯' : '二聯',

            發票抬頭: order.buyer || '',

            統一編號: formatTaxId(order.taxId)
        }
    })

    /**
     * 對帳用欄位
     *
     * 順序完全由這裡決定。
     */
    const reconciliationColumns = RECONCILIATION_BASE_COLUMNS

    const worksheet1 = processWorksheet(reconciliationData, XLSX, {
        columns: reconciliationColumns,
        headerHeight: 38,
        rowHeight: 28,
        autoFilter: true
    })

    /**
     * ==================================================
     * 工作表二：出貨用
     * ==================================================
     */

    /**
     * 動態商品數量欄位
     *
     * 每一項商品一個欄位。
     */
    const productColumns: ExcelColumn[] = productNames.map((productName) => ({
        key: productName,
        minWidth: 10,
        maxWidth: 20,
        align: 'right',
        numFmt: '0'
    }))

    /**
     * 出貨用欄位順序：
     *
     * 訂單日期
     * 訂單編號
     * 訂單內容
     * 商品A
     * 商品B
     * ...
     * 合計
     * 收件人姓名
     * 收件人電話
     * 收件地址
     * E-mail
     * 訂單狀態
     * 備註
     */
    const shippingColumns: ExcelColumn[] = [
        ...SHIPPING_BASE_COLUMNS,
        ...productColumns,
        ...SHIPPING_END_COLUMNS
    ]

    const shippingData = ordersSorted.map((order) => {
        const orderProductStats = getOrderProductStats(order, productNames)

        return {
            訂單日期: formatDate(order.orderDate),

            訂單編號: order.orderId || '',

            [PRODUCT_DETAIL_HEADER]: getOrderProductText(order),

            ...orderProductStats,

            合計: toNumber(order.totalPrice),

            收件人姓名: order.receiver?.name || '',

            收件人電話: order.phone || '',

            收件地址: order.receiver?.address || '',

            'E-mail': order.email || '',

            訂單狀態: order.status || '',

            備註: order.remark || ''
        }
    })

    const worksheet2 = processWorksheet(shippingData, XLSX, {
        columns: shippingColumns,
        headerHeight: 38,
        rowHeight: 28,
        autoFilter: true
    })

    /**
     * ==================================================
     * 建立 Workbook
     * ==================================================
     */

    const workbook = XLSX.utils.book_new()

    workbook.Props = {
        Title: '訂單資料',
        Subject: '訂單對帳及出貨資料',
        Author: '訂單管理系統',
        CreatedDate: new Date()
    }

    /**
     * 工作表名稱
     */
    XLSX.utils.book_append_sheet(workbook, worksheet1, '對帳用')

    XLSX.utils.book_append_sheet(workbook, worksheet2, '出貨用')

    /**
     * ==================================================
     * 輸出 XLSX
     * ==================================================
     */

    const buffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
        compression: true
    })

    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    const filename = `${formatDate(Date.now())}_訂單列表.xlsx`

    saveAs(blob, filename)
}

/**
 * ==================================================
 * Worksheet 處理
 * ==================================================
 */

/**
 * 建立 Worksheet
 *
 * 所有欄位資訊都由 columns 決定：
 *
 * - 欄位順序
 * - 欄寬
 * - 對齊
 * - 數字格式
 * - 是否換行
 */
function processWorksheet(
    data: ExcelRow[],
    XLSX: XLSXModule,
    options: WorksheetOptions
): WorkSheet {
    /**
     * 由 columns 產生明確的 Header 順序
     */
    const headers = options.columns.map((column) => column.key)

    /**
     * 明確指定 header。
     *
     * 不依賴 JavaScript Object.keys() 順序。
     */
    const worksheet = XLSX.utils.json_to_sheet(data, {
        header: headers
    })

    /**
     * 設定欄寬
     *
     * 根據實際內容自動計算，
     * 同時受到 minWidth / maxWidth 限制。
     */
    worksheet['!cols'] = options.columns.map((column) => ({
        wch: calculateAutoColumnWidth(
            data,
            column.key,
            column.minWidth ?? 10,
            column.maxWidth ?? 40
        )
    }))

    /**
     * 設定列高
     *
     * 會考慮：
     *
     * 1. \n 明確換行
     * 2. 欄寬不足造成的預估換行
     */
    setWorksheetRows(worksheet, data, options)

    /**
     * AutoFilter
     */
    setWorksheetAutoFilter(worksheet, data, XLSX, options)

    /**
     * Cell 樣式
     */
    applyWorksheetStyles(worksheet, XLSX, options)

    /**
     * 頁面邊界
     */
    worksheet['!margins'] = {
        left: 0.3,
        right: 0.3,
        top: 0.5,
        bottom: 0.5,
        header: 0.2,
        footer: 0.2
    }

    return worksheet
}

/**
 * ==================================================
 * 欄寬
 * ==================================================
 */

/**
 * 根據所有資料計算欄位最佳寬度。
 *
 * 流程：
 *
 * header
 *    +
 * 所有資料
 *    ↓
 * 計算最長文字
 *    ↓
 * + padding
 *    ↓
 * min / max 限制
 */
function calculateAutoColumnWidth(
    data: ExcelRow[],
    header: string,
    minWidth: number,
    maxWidth: number
): number {
    const values = [header, ...data.map((row) => String(row[header] ?? ''))]

    const longestWidth = Math.max(...values.flatMap((value) => getLineWidths(value)))

    return Math.min(Math.max(longestWidth + 3, minWidth), maxWidth)
}

/**
 * 取得多行文字每一行的寬度
 */
function getLineWidths(text: string): number[] {
    const lines = text.split(/\r?\n/)

    return lines.map((line) => calculateTextWidth(line))
}

/**
 * 計算中文字寬度。
 *
 * 中文、日文等全形字元：
 * 約 2 個英文字元寬度。
 */
function calculateTextWidth(text: string): number {
    return [...text].reduce((width, character) => {
        return width + (character.charCodeAt(0) > 255 ? 2 : 1)
    }, 0)
}

/**
 * ==================================================
 * Row Height
 * ==================================================
 */

function setWorksheetRows(worksheet: WorkSheet, data: ExcelRow[], options: WorksheetOptions): void {
    const headerHeight = options.headerHeight ?? 35

    const defaultRowHeight = options.rowHeight ?? 25

    /**
     * 欄位實際寬度
     */
    const columnWidths = options.columns.map((column) =>
        calculateAutoColumnWidth(data, column.key, column.minWidth ?? 10, column.maxWidth ?? 40)
    )

    worksheet['!rows'] = [
        /**
         * Header
         */
        {
            hpx: headerHeight
        },

        /**
         * Data rows
         */
        ...data.map((row) => ({
            hpx: calculateRowHeight(row, options.columns, columnWidths, defaultRowHeight)
        }))
    ]
}

/**
 * 根據內容估算 Row Height。
 *
 * 特別處理：
 *
 * - 訂單內容
 * - 收件地址
 * - 備註
 *
 * 等具有 wrapText 的欄位。
 */
function calculateRowHeight(
    row: ExcelRow,
    columns: ExcelColumn[],
    columnWidths: number[],
    defaultHeight: number
): number {
    let maxLines = 1

    columns.forEach((column, columnIndex) => {
        if (!column.wrapText) {
            return
        }

        const value = String(row[column.key] ?? '')

        if (!value) {
            return
        }

        const columnWidth = columnWidths[columnIndex] ?? 20

        const lines = value.split(/\r?\n/)

        let estimatedLines = 0

        lines.forEach((line) => {
            const textWidth = calculateTextWidth(line)

            estimatedLines += Math.max(1, Math.ceil(textWidth / columnWidth))
        })

        maxLines = Math.max(maxLines, estimatedLines)
    })

    /**
     * 每行約 18px，
     * 再加上下留白。
     */
    return Math.max(defaultHeight, maxLines * 18 + 10)
}

/**
 * ==================================================
 * Auto Filter
 * ==================================================
 */

function setWorksheetAutoFilter(
    worksheet: WorkSheet,
    data: ExcelRow[],
    XLSX: XLSXModule,
    options: WorksheetOptions
): void {
    if (!options.autoFilter || !options.columns.length) {
        return
    }

    worksheet['!autofilter'] = {
        ref: XLSX.utils.encode_range({
            s: {
                r: 0,
                c: 0
            },
            e: {
                /**
                 * 第 0 列為表頭，
                 * 因此最後資料列：
                 *
                 * data.length
                 */
                r: data.length,

                /**
                 * 最後一個欄位
                 */
                c: options.columns.length - 1
            }
        })
    }
}

/**
 * ==================================================
 * Cell Styles
 * ==================================================
 */

function applyWorksheetStyles(
    worksheet: WorkSheet,
    XLSX: XLSXModule,
    options: WorksheetOptions
): void {
    const worksheetRef = worksheet['!ref']

    if (!worksheetRef) {
        return
    }

    const range = XLSX.utils.decode_range(worksheetRef)

    for (let rowIndex = range.s.r; rowIndex <= range.e.r; rowIndex++) {
        for (let columnIndex = range.s.c; columnIndex <= range.e.c; columnIndex++) {
            const cellAddress = XLSX.utils.encode_cell({
                r: rowIndex,
                c: columnIndex
            })

            const cell = worksheet[cellAddress]

            if (!cell) {
                continue
            }

            /**
             * Header
             */
            if (rowIndex === 0) {
                cell.s = HEADER_STYLE
                continue
            }

            /**
             * 取得目前欄位設定
             */
            const column = options.columns[columnIndex]

            if (!column) {
                continue
            }

            const bodyStyle: CellStyle = {
                font: {
                    name: 'Microsoft JhengHei',
                    sz: 10
                },

                alignment: {
                    horizontal: column.align ?? 'center',

                    vertical: 'center',

                    wrapText: column.wrapText ?? false
                },

                border: borderStyle()
            }

            /**
             * 數字格式
             */
            if (column.numFmt) {
                bodyStyle.numFmt = column.numFmt
            }

            cell.s = bodyStyle
        }
    }
}

/**
 * ==================================================
 * 商品統計
 * ==================================================
 */

/**
 * 取得所有不重複商品。
 *
 * 使用 productId 判斷是否為同一商品。
 */
function getUniqueProducts(orders: OrderData[]): {
    productId: string
    productName: string
}[] {
    const productMap = new Map<string, string>()

    orders.forEach((order) => {
        getOrderItems(order)
            .filter((item) => item.productId && item.productName)
            .forEach((item) => {
                if (item.productId && !productMap.has(item.productId)) {
                    productMap.set(item.productId, item.productName)
                }
            })
    })

    return Array.from(productMap, ([productId, productName]) => ({
        productId,
        productName
    })).sort((a, b) => a.productId.localeCompare(b.productId))
}

/**
 * 建立商品數量統計物件。
 *
 * 例如：
 *
 * {
 *     '公司登記實務': 0,
 *     '閉鎖性股份有限公司': 0
 * }
 */
function createEmptyProductStats(productNames: string[]): Record<string, number> {
    return Object.fromEntries(productNames.map((productName) => [productName, 0]))
}

/**
 * 取得單筆訂單的商品數量。
 *
 * 例如：
 *
 * {
 *     '公司登記實務': 2,
 *     '閉鎖性股份有限公司': 1
 * }
 */
function getOrderProductStats(order: OrderData, productNames: string[]): Record<string, number> {
    const stats = createEmptyProductStats(productNames)

    getOrderItems(order).forEach((item) => {
        const productName = item.productName

        if (!Object.prototype.hasOwnProperty.call(stats, productName)) {
            return
        }

        /**
         * 使用累加。
         *
         * 如果同一張訂單出現相同商品
         * 也能正確統計。
         */
        stats[productName] = (stats[productName] ?? 0) + toNumber(item.qty)
    })

    return stats
}

/**
 * ==================================================
 * 訂單內容
 * ==================================================
 */

/**
 * 產生 Excel 中的「訂單內容」。
 *
 * 例如：
 *
 * 公司登記實務及案例解析(共三冊)
 * 2 × 4,500 ＝ 9,000
 *
 * 閉鎖性股份有限公司登記實務案例解析
 * 1 × 2,000 ＝ 2,000
 */
function getOrderProductText(order: OrderData): string {
    return getOrderItems(order)
        .map((item) => {
            const qty = toNumber(item.qty)

            const unitPrice = toNumber(item.unitPrice)

            const totalPrice = toNumber(item.totalPrice)

            return [
                item.productName,
                `${qty} × ${thousandthsFormat(unitPrice)} ＝ ${thousandthsFormat(totalPrice)}`
            ].join('\n')
        })
        .join('\n\n')
}

/**
 * 取得訂單商品
 */
function getOrderItems(order: OrderData): OrderItem[] {
    return Object.values(order.orderList ?? {}) as OrderItem[]
}

/**
 * ==================================================
 * Excel Border
 * ==================================================
 */

function borderStyle(): NonNullable<CellStyle['border']> {
    const border = {
        style: 'thin' as const,

        color: {
            rgb: 'CCCCCC'
        }
    }

    return {
        top: border,
        bottom: border,
        left: border,
        right: border
    }
}

/**
 * ==================================================
 * 格式處理
 * ==================================================
 */

/**
 * 統一編號格式
 *
 * 例如：
 *
 * 12345678
 * ↓
 * 1234-5678
 */
function formatTaxId(taxId?: string | null): string {
    if (!taxId) {
        return ''
    }

    const normalizedTaxId = taxId.replace(/\D/g, '')

    if (normalizedTaxId.length !== 8) {
        return taxId
    }

    return `${normalizedTaxId.slice(0, 4)}-${normalizedTaxId.slice(4)}`
}

/**
 * 千分位格式
 *
 * 例如：
 *
 * 4500
 * ↓
 * 4,500
 */
function thousandthsFormat(value: unknown): string {
    return new Intl.NumberFormat('zh-TW', {
        maximumFractionDigits: 2
    }).format(toNumber(value))
}

/**
 * 轉 Number
 */
function toNumber(value: unknown): number {
    const numberValue = Number(value)

    return Number.isFinite(numberValue) ? numberValue : 0
}

/**
 * 日期格式
 *
 * yyyy-mm-dd
 */
function formatDate(value: unknown): string {
    const date = normalizeDate(value)

    if (!date) {
        return ''
    }

    const formatter = new Intl.DateTimeFormat('zh-TW', {
        timeZone: 'Asia/Taipei',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    })

    const parts = formatter.formatToParts(date)

    const year = parts.find((part) => part.type === 'year')?.value

    const month = parts.find((part) => part.type === 'month')?.value

    const day = parts.find((part) => part.type === 'day')?.value

    if (!year || !month || !day) {
        return ''
    }

    return `${year}-${month}-${day}`
}

/**
 * 將各種日期格式轉成 Date。
 *
 * 支援：
 *
 * - Date
 * - Firebase Timestamp
 * - timestamp number
 * - string
 */
function normalizeDate(value: unknown): Date | null {
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value
    }

    /**
     * Firebase Timestamp
     */
    if (typeof value === 'object' && value !== null && 'toDate' in value) {
        const timestamp = value as {
            toDate?: () => Date
        }

        if (typeof timestamp.toDate === 'function') {
            const date = timestamp.toDate()

            return Number.isNaN(date.getTime()) ? null : date
        }
    }

    if (typeof value !== 'string' && typeof value !== 'number') {
        return null
    }

    const date = new Date(value)

    return Number.isNaN(date.getTime()) ? null : date
}
