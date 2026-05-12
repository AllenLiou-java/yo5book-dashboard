import { GroupBuyingRepository } from '~/domain/repositories/GroupBuyingRepository'
import type { GroupBuyingData, FormState } from '~/types/groupBuying'

export const useGroupBuying = () => {
    const groupBuyingRepository = new GroupBuyingRepository()

    const findAll = () => {
        return groupBuyingRepository.findAll()
    }

    const findByGroupId = (groupId: string) => {
        return groupBuyingRepository.findByGroupId(groupId)
    }

    const update = (orderId: string, data: Partial<GroupBuyingData>) => {
        return groupBuyingRepository.update(orderId, data)
    }

    const create = (data: FormState) => {
        return groupBuyingRepository.create(data)
    }

    const remove = (groupId: string) => {
        return groupBuyingRepository.delete(groupId)
    }

    return {
        findAll,
        findByGroupId,
        update,
        create,
        remove
    }
}
