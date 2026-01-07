import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { Redis } from 'ioredis';
import * as schema from 'src/database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';


const API_KEY_TTL = 60 * 15;
const API_KEY_PREFIX = 'apikey:';

@Injectable()
export class AuthService {
  constructor(
    @Inject('DRIZZLE_CLIENT') private readonly db: NodePgDatabase<typeof schema>,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async validateApiKey(apiKey: string) {

    const cacheKey = `${API_KEY_PREFIX}${apiKey}`;
    
    if (await this.redis.exists(cacheKey)) {
      return true;
    };

    const result = await this.db.execute(
      sql`
      select exists (
        select 1
        from companies
        where api_key = ${apiKey}
      ) as exists
    `,
    );

     if (result.rowCount === 0) {
      return false;
     };
     
     await this.redis.setex(cacheKey, API_KEY_TTL, '1');

     return true;

  }
}
