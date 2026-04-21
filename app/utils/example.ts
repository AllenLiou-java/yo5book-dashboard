import type { CompanyInfo } from '~/types/example'

// 3. 建立一個處理公司資料的函式
export function processCompanyData(company: CompanyInfo) {
    // console.log(`正在處理【${company.name}】的資料...`)

    // 正常的邏輯：如果資本額大於 50 萬且狀態為 approved，就允許營業
    if (company.capital >= 500000 && company.status === 'approved') {
        company.isReadyForBusiness = true
    }

    return company
}

// --- 🛑 下方是我們要用來測試 TypeScript 的區塊 ---

export function testTypeScriptErrors() {
    // 測試 A：建立一個缺少必要屬性、或者型別給錯的物件
    const myCompany: CompanyInfo = {
        taxId: '12345678',
        name: '測試企業有限公司',
        // ❌ 故意把 number 寫成 string (取消下一行的註解來測試)
        // capital: '一百萬',

        // ❌ 故意拼錯狀態 (取消下一行的註解來測試)
        // status: 'approvd',

        capital: 1000000,
        status: 'pending',
        isReadyForBusiness: false
    }

    // 測試 B：故意傳遞錯誤型別給函式
    // ❌ processCompanyData 規定要傳入 CompanyInfo 物件，我們卻傳了字串 (取消下一行的註解來測試)
    // processCompanyData('這是一段字串')

    return processCompanyData(myCompany)
}
