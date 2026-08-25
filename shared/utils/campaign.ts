import { CAMPAIGN_TYPE, ID_TYPE, ORG_TYPE } from '#shared/constants/mail'

export type CampaignType = (typeof CAMPAIGN_TYPE)[keyof typeof CAMPAIGN_TYPE]

export type IdType = (typeof ID_TYPE)[keyof typeof ID_TYPE]

export type OrgType = (typeof ORG_TYPE)[keyof typeof ORG_TYPE]

export interface ParsedCampaignId {
    campaignType: CampaignType
    date: string
    idType: IdType
    orgType: OrgType
}

function isValueOf<T extends string>(values: readonly T[], value: string): value is T {
    return values.includes(value as T)
}

export function parseCampaignId(campaignId: string): ParsedCampaignId | null {
    const parts = campaignId.split('-')

    if (parts.length !== 3) {
        return null
    }

    const [campaignDate, idType, orgType] = parts

    if (!campaignDate || !idType || !orgType) {
        return null
    }

    const date = campaignDate.slice(-8)
    const campaignType = campaignDate.slice(0, -8)

    if (!isValueOf(Object.values(CAMPAIGN_TYPE), campaignType)) {
        return null
    }

    if (!/^\d{8}$/.test(date)) {
        return null
    }

    if (!isValueOf(Object.values(ID_TYPE), idType)) {
        return null
    }

    if (!isValueOf(Object.values(ORG_TYPE), orgType)) {
        return null
    }

    return {
        campaignType,
        date,
        idType,
        orgType
    }
}
