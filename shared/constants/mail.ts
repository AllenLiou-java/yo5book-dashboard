// shared/constants/mail.ts

export const CAMPAIGN_TYPE = {
    NEW_BOOK: 'NB',
    PROMOTION: 'PR',
    GROUP_BUYING: 'GB',
    OTHER: 'OTHER'
} as const

export const CAMPAIGN_TYPE_OPTIONS = [
    { label: '新書上市', value: CAMPAIGN_TYPE.NEW_BOOK },
    { label: '優惠活動', value: CAMPAIGN_TYPE.PROMOTION },
    { label: '團購活動', value: CAMPAIGN_TYPE.GROUP_BUYING },
    { label: '其他', value: CAMPAIGN_TYPE.OTHER }
]

export const ID_TYPE = {
    CPA: 'CPA',
    CPB: 'CPB',
    OTHER: 'OTHER'
} as const

export const ID_TYPE_OPTIONS = [
    { label: '會計師', value: ID_TYPE.CPA },
    { label: '記帳士相關', value: ID_TYPE.CPB },
    { label: '其他', value: ID_TYPE.OTHER }
]

export const ORG_TYPE = {
    FIRM: 'Firm',
    ASSOCIATION: 'Assn'
} as const

export const ORG_TYPE_OPTIONS = [
    { label: '個人事務所', value: ORG_TYPE.FIRM },
    { label: '公會團體', value: ORG_TYPE.ASSOCIATION }
]
