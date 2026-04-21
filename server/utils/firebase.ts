import admin from 'firebase-admin'

// 確保不會重複初始化
if (!admin.apps.length) {
    const config = useRuntimeConfig()

    admin.initializeApp({
        // 請替換成你從 Firebase 後台下載的 Service Account 金鑰
        credential: admin.credential.cert({
            projectId: config.firebaseProjectId,
            clientEmail: config.firebaseClientEmail,
            privateKey: config.firebasePrivateKey?.replace(/\\n/g, '\n')
        }),
        databaseURL: config.firebaseApiUrl
    })
}

export const db = admin.database()
