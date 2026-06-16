import { google } from 'googleapis'
const config = useRuntimeConfig()

// 根據你的環境選擇 OAuth2 或 Service Account
export const driveAuth = new google.auth.GoogleAuth({
    credentials: {
        client_email: config.firebaseClientEmail,
        private_key: config.firebasePrivateKey?.replace(/\\n/g, '\n')
    },
    scopes: ['https://www.googleapis.com/auth/drive']
})

export const getDriveClient = () => {
    return google.drive({ version: 'v3', auth: driveAuth })
}
