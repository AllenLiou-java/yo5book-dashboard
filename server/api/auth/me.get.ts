export default defineEventHandler(async (event) => {
    const admin = event.context.admin

    return {
        success: true,
        user: {
            id: admin.id,
            email: admin.email
        }
    }
})
