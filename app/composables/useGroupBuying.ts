import { GroupBuyingRepository } from '~/domain/repositories/GroupBuyingRepository'
import type { GroupBuyingData, FormState } from '~/types/groupBuying'

export const useGroupBuying = () => {
    const groupBuyingRepository = new GroupBuyingRepository()
    // 在 composable 的頂層呼叫 useRequestFetch，這是有效的上下文
    const requestFetch = useRequestFetch()

    const findAll = () => {
        return groupBuyingRepository.findAll(requestFetch)
    }

    const findByGroupId = (groupId: string) => {
        return groupBuyingRepository.findByGroupId(requestFetch, groupId)
    }

    const update = (orderId: string, data: Partial<GroupBuyingData>) => {
        return groupBuyingRepository.update(requestFetch, orderId, data)
    }

    const create = (data: FormState) => {
        return groupBuyingRepository.create(requestFetch, data)
    }

    const remove = (groupId: string) => {
        return groupBuyingRepository.delete(requestFetch, groupId)
    }

    return {
        findAll,
        findByGroupId,
        update,
        create,
        remove
    }
}
