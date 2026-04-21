export const getStatusBadgeClass = (status: 'active' | 'ended' | undefined) => {
    switch (status) {
        case 'active':
            return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
        case 'ended':
            return 'bg-slate-100 text-slate-500 line-through dark:bg-slate-800 dark:text-slate-400'
        default:
            return 'bg-slate-100 text-slate-500'
    }
}
