import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';
import * as schema from './schema';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { ISOLogger } from 'src/logger/iso-logger.service';


@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  public db: NodePgDatabase<typeof schema>;

  constructor(
    private configService: ConfigService,
    private logger: ISOLogger,
  ) {
    this.logger.setContext(DrizzleService.name);
  }

  async onModuleInit() {
    try {
      this.pool = new Pool({
        connectionString: this.configService.get<string>('DATABASE_URL'),
      });

      this.db = drizzle(this.pool, { schema });

      this.logger.log('Database connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect to Db', error.stack);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
    this.logger.log('Database connection pool closed');
  }
}
