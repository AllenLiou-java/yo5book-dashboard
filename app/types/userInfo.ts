export interface UserInfo {
    name: string // 帳戶名稱
    email: string // email
    emailVerified?: boolean // 帳戶是否驗證
    picture: string // 帳戶頭像
    userUid: string // 帳戶 ID,
    role: 'user' | 'admin' // 帳戶角色
}

export interface AdminInfo {
    username?: string // 帳號名稱
    email: string // email
    password: string // 帳戶密碼
    id?: string // 帳戶 ID
    status?: 'active' | 'inactive' // 帳戶狀態
    createdAt?: number // 帳戶建立時間
}
