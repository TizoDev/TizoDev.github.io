import pkg from 'pg';
const { Client } = pkg;

export async function connectBD() {
    try {
      const client = new Client({
        connectionString: 'postgresql://neondb_owner:npg_c6Bd8XxAUgKV@ep-small-lake-agdut2b3-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
        ssl: {
          rejectUnauthorized: false
        }
      });
  
      await client.connect();
      console.log('Conexión establecida');
      return client;
    } catch (err) {
      console.error('Error de conexión:', err);
    }
  }