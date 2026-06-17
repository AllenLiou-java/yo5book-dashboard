import fileSaver from 'file-saver'
import type { OrderData, OrderItem } from '~/types/order'

const { saveAs } = fileSaver

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const XLSX: any

export function exportOrdersExcel(orders: OrderData[]) {
    const exportData = orders.map((order) => {
        // 商品資訊（換行）
        const productText = Object.values(order.orderList || {})
            .map((item: OrderItem) => {
                return [
                    item.productName,
                    `${item.qty} × ${thousandthsFormat(item.unitPrice)} ＝ ${thousandthsFormat(item.totalPrice)}`
                ].join('\n')
            })
            .join('\n\n')

        return {
            訂單日期: formatDate(order.orderDate),
            訂單號碼: order.orderId || '',
            '品名｜數量｜單價｜金額': productText,
            合計: thousandthsFormat(order.totalPrice),
            收件人姓名: order.receiver?.name || '',
            收件人電話: order.phone || '',
            收件地址: order.receiver?.address || '',
            'E-mail': order.email || '',
            帳號後5碼: order.bankAccountNo || '',
            發票型式: (order.taxId?.length ?? 0) > 0 ? '三聯' : '二聯',
            發票抬頭: order.buyer || '',
            統一編號:
                order.taxId?.length === 8
                    ? `${order.taxId.slice(0, 4)} - ${order.taxId.slice(4)}`
                    : order.taxId || ''
        }
    })

    // 建立 worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData)

    // 欄寬
    worksheet['!cols'] = [
        { wch: 11 },
        { wch: 17 },
        { wch: 50 },
        { wch: 10 },
        { wch: 18 },
        { wch: 18 },
        { wch: 40 },
        { wch: 30 },
        { wch: 11 },
        { wch: 10 },
        { wch: 25 },
        { wch: 10 }
    ]

    // 列高（自動依換行數調整）
    worksheet['!rows'] = [
        { hpx: 35 }, // 表頭

        ...exportData.map((row) => {
            const lines = String(row['品名｜數量｜單價｜金額'] || '').split('\n').length

            return {
                hpx: Math.max(60, lines * 22)
            }
        })
    ]

    // 範圍
    const range = XLSX.utils.decode_range(worksheet['!ref'])

    // 全部儲存格樣式
    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })

            const cell = worksheet[cellAddress]

            if (!cell) continue

            // 表頭
            if (R === 0) {
                cell.s = {
                    font: {
                        bold: true
                    },
                    alignment: {
                        horizontal: 'center',
                        vertical: 'center',
                        wrapText: true
                    },
                    fill: {
                        fgColor: {
                            rgb: 'D9D9D9'
                        }
                    },
                    border: borderStyle()
                }
            } else {
                // 內容
                cell.s = {
                    alignment: {
                        horizontal: C === 2 ? 'left' : 'center',
                        vertical: 'center',
                        wrapText: true
                    },
                    border: borderStyle()
                }
            }
        }
    }

    // workbook
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, '訂單列表')

    // 匯出
    const buffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array'
    })

    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    saveAs(blob, `${formatDate(Date.now())}_訂單列表.xlsx`)
}

// ===== 工具 =====

// 邊框
function borderStyle() {
    return {
        top: {
            style: 'thin',
            color: { rgb: 'CCCCCC' }
        },
        bottom: {
            style: 'thin',
            color: { rgb: 'CCCCCC' }
        },
        left: {
            style: 'thin',
            color: { rgb: 'CCCCCC' }
        },
        right: {
            style: 'thin',
            color: { rgb: 'CCCCCC' }
        }
    }
}
