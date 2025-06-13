import Fastify from 'fastify'
import Database from './src/config/database.js'
import { checkBucketConnection } from './src/config/minio.js'

const fastify = Fastify({
    logger: true
})

const start = async () => {
    try {
        await Database.connect()
        const minioConnected = await checkBucketConnection()
        if (!minioConnected) {
            await Database.disconnect()
            process.exit(1)
        }
        await fastify.listen({
            port: 3000,
            host: '0.0.0.0' // CORS
        })
        console.log('🚀 Servidor corriendo en http://localhost:3000')
    } catch (err) {
        fastify.log.error(err)
        await Database.disconnect()
        process.exit(1)
    }
}

start()