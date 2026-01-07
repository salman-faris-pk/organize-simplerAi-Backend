import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';


export const drizzleProvider: Provider = {
  provide: 'DRIZZLE_CLIENT',
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    
    const databaseUrl = configService.get<string>('DATABASE_URL');

    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }

    const pool = new Pool({
      connectionString: databaseUrl,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    const db = drizzle(pool, { schema });
    
    setInterval(() => db.execute(`SELECT 1`), 5000);

    return db;
  },
};
