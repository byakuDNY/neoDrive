import { Client as MinioClient } from 'minio'

const config = {
    endPoint: 's3.us-east-005.backblazeb2.com',
    port: 443,
    useSSL: true,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
    bucket: process.env.MINIO_BUCKET,
}

const minioClient = new MinioClient({
    endPoint: config.endPoint,
    port: config.port,
    useSSL: config.useSSL,
    accessKey: config.accessKey,
    secretKey: config.secretKey,
})

async function checkBucketConnection() {
    try {
        const exists = await minioClient.bucketExists(config.bucket)
        if (exists) {
            console.log(`✅ Conectado al bucket "${config.bucket}" exitosamente!`)
        } else {
            console.error(`❌ Bucket "${config.bucket}" no existe.`)
        }
        return exists
    } catch (error) {
        console.error('❌ Error de conexión a bucket:', error)
        return false
    }
}

export { minioClient, config as minioConfig, checkBucketConnection }
