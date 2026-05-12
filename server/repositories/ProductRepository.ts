import type { ProductSimple } from '~/types/product'

export const ProductSimpleRepository = {
    async findAll(): Promise<Record<string, ProductSimple>> {
        const snapshot = await db.ref(`products_simple`).get()
        return snapshot.val() || {}
    },
    async findByGroupId(groupId: string): Promise<ProductSimple> {
        const snapshot = await db.ref(`products_simple/${groupId}`).get()
        return snapshot.val() || {}
    },
    async update(groupId: string, data: Partial<ProductSimple>) {
        await db.ref(`products_simple/${groupId}`).update(data)
    },
    async create(data: ProductSimple) {
        const newRef = db.ref('products_simple').push()
        await newRef.set(data)
        return newRef.key
    },
    async delete(groupId: string) {
        await db.ref(`products_simple/${groupId}`).remove()
    }
}
