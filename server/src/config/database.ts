import mongoose, { Connection } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

class Database {
  private mongoUri: string | undefined;
  private options: mongoose.ConnectOptions;

  constructor() {
    this.mongoUri = process.env.MONGODB_URI;
    this.options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      bufferCommands: false,
    };
  }

  async connect(): Promise<void> {
    try {
      if (!this.mongoUri) {
        throw new Error('MONGODB_URI is not defined in environment variables');
      }
      await mongoose.connect(this.mongoUri, this.options);
      console.log('🍃 Conectado a MongoDB exitosamente');
      console.log(`📍 Base de datos: ${mongoose.connection.name}`);

      mongoose.connection.on('error', (err) => {
        console.error('❌ Error de conexión a MongoDB:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('🔌 Desconectado de MongoDB');
      });

      process.on('SIGINT', () => {
        mongoose.connection.close().then(() => {
          console.log('🔐 Conexión a MongoDB cerrada por terminación de la aplicación');
          process.exit(0);
        });
      });

    } catch (error) {
      console.error('❌ Error al conectar con MongoDB:', error);
      process.exit(1);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      console.log('🔌 Desconectado de MongoDB');
    } catch (error) {
      console.error('❌ Error al desconectar de MongoDB:', error);
    }
  }

  getConnection(): Connection {
    return mongoose.connection;
  }

  isConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }
}

export default new Database();