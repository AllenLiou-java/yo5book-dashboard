import fileSaver from 'file-saver'
import type { CellStyle, ColInfo, WorkSheet } from 'xlsx-js-style'
import type { OrderData, OrderItem } from '~/types/order'

const { saveAs } = fileSaver

type XLSXModule = typeof import('xlsx-js-style')

type ExcelValue = string | number | boolean | Date

type ExcelRow = Record<string, ExcelValue>

interface WorksheetOptions {
    headers: string[]
    cols: ColInfo[]
    leftAlignHeaders?: string[]
    rightAlignHeaders?: string[]
    numberFormats?: Record<string, string>
    dynamicRowHeightHeader?: string
    headerHeight?: number
    rowHeight?: number
    autoFilter?: boolean
}

const PRODUCT_DETAIL_HEADER = '品名｜數量｜單價｜金額'

const ORDER_FIXED_HEADERS = [
    '訂單日期',
    '訂單號碼',
    PRODUCT_DETAIL_HEADER,
    '合計',
    '收件人姓名',
    '收件人電話',
    '收件地址',
    'E-mail',
    '帳號後5碼',
    '發票型式',
    '發票抬頭',
    '統一編號'
]

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

export async function exportOrdersExcel(orders: OrderData[]): Promise<void> {
    if (import.meta.server) {
        throw new Error('Excel 匯出功能只能在瀏覽器端執行')
    }

    if (!orders.length) {
        throw new Error('目前沒有可匯出的訂單資料')
    }

    /*
     * 動態載入大型套件，只有使用者按下匯出時才下載。
     * 同時避免 SSR 階段載入瀏覽器端功能。
     */
    const XLSX = await import('xlsx-js-style')

    const productNames = getUniqueProductNames(orders)

    // 每一項商品會在訂單列表中建立一個數量欄位
    const orderHeaders = [...ORDER_FIXED_HEADERS, ...productNames]

    // ==========================================
    // 工作表一：訂單列表
    // ==========================================

    const exportData: ExcelRow[] = orders.map((order) => {
        const orderProductStats = getOrderProductStats(order, productNames)

        const productText = getOrderItems(order)
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

        return {
            訂單日期: formatDate(order.orderDate),
            訂單號碼: order.orderId || '',
            [PRODUCT_DETAIL_HEADER]: productText,

            /*
             * 保留 number 型別。
             * Excel 裡才能正確排序、篩選及加總。
             */
            合計: toNumber(order.totalPrice),

            收件人姓名: order.receiver?.name || '',
            收件人電話: order.phone || '',
            收件地址: order.receiver?.address || '',
            'E-mail': order.email || '',
            帳號後5碼: order.bankAccountNo || '',
            發票型式: order.taxId?.length ? '三聯' : '二聯',
            發票抬頭: order.buyer || '',
            統一編號: formatTaxId(order.taxId),
            ...orderProductStats
        }
    })

    const orderCols: ColInfo[] = [
        { wch: 12 }, // 訂單日期
        { wch: 18 }, // 訂單號碼
        { wch: 50 }, // 商品資訊
        { wch: 12 }, // 合計
        { wch: 16 }, // 收件人姓名
        { wch: 16 }, // 收件人電話
        { wch: 40 }, // 收件地址
        { wch: 30 }, // E-mail
        { wch: 12 }, // 帳號後5碼
        { wch: 10 }, // 發票型式
        { wch: 24 }, // 發票抬頭
        { wch: 13 }, // 統一編號

        // 動態商品數量欄位
        ...productNames.map((productName) => ({
            wch: calculateColumnWidth(productName, 12, 28)
        }))
    ]

    const orderNumberFormats: Record<string, string> = {
        合計: '#,##0',
        ...Object.fromEntries(productNames.map((productName) => [productName, '0']))
    }

    const worksheet1 = processWorksheet(exportData, XLSX, {
        headers: orderHeaders,
        cols: orderCols,
        leftAlignHeaders: [PRODUCT_DETAIL_HEADER, '收件地址', 'E-mail', '發票抬頭'],
        rightAlignHeaders: ['合計'],
        numberFormats: orderNumberFormats,
        dynamicRowHeightHeader: PRODUCT_DETAIL_HEADER,
        headerHeight: 38,
        rowHeight: 28,
        autoFilter: true
    })

    // ==========================================
    // 工作表二：商品銷售統計摘要
    // ==========================================

    const summaryStats = createEmptyProductStats(productNames)

    orders.forEach((order) => {
        getOrderItems(order).forEach((item) => {
            const productName = item.productName
            const qty = toNumber(item.qty)

            summaryStats[productName] = (summaryStats[productName] ?? 0) + qty
        })
    })

    const summaryHeaders = ['商品名稱', '總銷售數量']

    const summaryData: ExcelRow[] = Object.entries(summaryStats).map(([productName, qty]) => ({
        商品名稱: productName,
        總銷售數量: qty
    }))

    const longestProductWidth = productNames.reduce((maxWidth, productName) => {
        return Math.max(maxWidth, calculateTextWidth(productName))
    }, 20)

    const summaryCols: ColInfo[] = [
        {
            wch: Math.min(Math.max(longestProductWidth + 3, 30), 55)
        },
        { wch: 16 }
    ]

    const worksheet2 = processWorksheet(summaryData, XLSX, {
        headers: summaryHeaders,
        cols: summaryCols,
        leftAlignHeaders: ['商品名稱'],
        rightAlignHeaders: ['總銷售數量'],
        numberFormats: {
            總銷售數量: '0'
        },
        headerHeight: 38,
        rowHeight: 26,
        autoFilter: true
    })

    // ==========================================
    // 建立 Workbook
    // ==========================================

    const workbook = XLSX.utils.book_new()

    workbook.Props = {
        Title: '訂單列表',
        Subject: '訂單及商品銷售統計',
        Author: '訂單管理系統',
        CreatedDate: new Date()
    }

    XLSX.utils.book_append_sheet(workbook, worksheet1, '訂單列表')

    XLSX.utils.book_append_sheet(workbook, worksheet2, '商品銷售統計摘要')

    // ==========================================
    // 輸出 XLSX
    // ==========================================

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

// ==================================================
// Worksheet 處理
// ==================================================

function processWorksheet(
    data: ExcelRow[],
    XLSX: XLSXModule,
    options: WorksheetOptions
): WorkSheet {
    /*
     * 明確指定 header，避免商品名稱剛好是純數字時，
     * JavaScript 物件欄位順序被重新排列。
     */
    const worksheet = XLSX.utils.json_to_sheet(data, {
        header: options.headers
    })

    worksheet['!cols'] = options.cols

    setWorksheetRows(worksheet, data, options)

    setWorksheetAutoFilter(worksheet, data, XLSX, options)

    applyWorksheetStyles(worksheet, XLSX, options)

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

function setWorksheetRows(worksheet: WorkSheet, data: ExcelRow[], options: WorksheetOptions): void {
    const headerHeight = options.headerHeight ?? 35
    const defaultRowHeight = options.rowHeight ?? 25
    const dynamicHeader = options.dynamicRowHeightHeader

    worksheet['!rows'] = [
        {
            hpx: headerHeight
        },
        ...data.map((row) => {
            if (!dynamicHeader) {
                return {
                    hpx: defaultRowHeight
                }
            }

            const content = String(row[dynamicHeader] ?? '')

            const lineCount = Math.max(content.split(/\r?\n/).length, 1)

            return {
                hpx: Math.max(defaultRowHeight, lineCount * 20 + 12)
            }
        })
    ]
}

function setWorksheetAutoFilter(
    worksheet: WorkSheet,
    data: ExcelRow[],
    XLSX: XLSXModule,
    options: WorksheetOptions
): void {
    if (!options.autoFilter || !options.headers.length) {
        return
    }

    worksheet['!autofilter'] = {
        ref: XLSX.utils.encode_range({
            s: {
                r: 0,
                c: 0
            },
            e: {
                /*
                 * 第 0 列是表頭，因此最後一列索引等於資料筆數
                 */
                r: data.length,
                c: options.headers.length - 1
            }
        })
    }
}

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

    const leftAlignHeaders = new Set(options.leftAlignHeaders ?? [])

    const rightAlignHeaders = new Set(options.rightAlignHeaders ?? [])

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

            if (rowIndex === 0) {
                cell.s = HEADER_STYLE
                continue
            }

            const header = options.headers[columnIndex] ?? ''

            let horizontal: 'left' | 'center' | 'right' = 'center'

            if (leftAlignHeaders.has(header)) {
                horizontal = 'left'
            } else if (rightAlignHeaders.has(header)) {
                horizontal = 'right'
            }

            const bodyStyle: CellStyle = {
                font: {
                    name: 'Microsoft JhengHei',
                    sz: 10
                },
                alignment: {
                    horizontal,
                    vertical: 'center',
                    wrapText: true
                },
                border: borderStyle()
            }

            const numberFormat = options.numberFormats?.[header]

            if (numberFormat) {
                bodyStyle.numFmt = numberFormat
            }

            cell.s = bodyStyle
        }
    }
}

// ==================================================
// 商品統計
// ==================================================

function getUniqueProductNames(orders: OrderData[]): string[] {
    const productNames = orders.flatMap((order) =>
        getOrderItems(order)
            .map((item) => item.productName?.trim())
            .filter((productName): productName is string => Boolean(productName))
    )

    /*
     * Set 會保留商品第一次出現的順序。
     */
    return [...new Set(productNames)]
}

function createEmptyProductStats(productNames: string[]): Record<string, number> {
    return Object.fromEntries(productNames.map((productName) => [productName, 0]))
}

function getOrderProductStats(order: OrderData, productNames: string[]): Record<string, number> {
    const stats = createEmptyProductStats(productNames)

    getOrderItems(order).forEach((item) => {
        const productName = item.productName

        if (!Object.prototype.hasOwnProperty.call(stats, productName)) {
            return
        }

        /*
         * 使用累加而非直接覆蓋。
         * 同一張訂單若出現相同商品，也能正確統計。
         */
        stats[productName] = (stats[productName] ?? 0) + toNumber(item.qty)
    })

    return stats
}

function getOrderItems(order: OrderData): OrderItem[] {
    return Object.values(order.orderList ?? {}) as OrderItem[]
}

// ==================================================
// 樣式
// ==================================================

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

// ==================================================
// 格式處理
// ==================================================

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

function thousandthsFormat(value: unknown): string {
    return new Intl.NumberFormat('zh-TW', {
        maximumFractionDigits: 2
    }).format(toNumber(value))
}

function toNumber(value: unknown): number {
    const numberValue = Number(value)

    return Number.isFinite(numberValue) ? numberValue : 0
}

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

function normalizeDate(value: unknown): Date | null {
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value
    }

    /*
     * 支援 Firebase Timestamp 等具有 toDate() 的物件。
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

// ==================================================
// 欄寬處理
// ==================================================

function calculateColumnWidth(text: string, minWidth: number, maxWidth: number): number {
    return Math.min(Math.max(calculateTextWidth(text) + 3, minWidth), maxWidth)
}

function calculateTextWidth(text: string): number {
    return [...text].reduce((width, character) => {
        /*
         * 中文、日文等全形字元約佔兩個英文字元寬度。
         */
        return width + (character.charCodeAt(0) > 255 ? 2 : 1)
    }, 0)
}
