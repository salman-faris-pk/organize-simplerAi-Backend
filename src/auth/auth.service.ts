import { Inject, Injectable } from '@nestjs/common';
import { ISOLogger } from 'src/logger/iso-logger.service';
import { sql } from 'drizzle-orm';
import { Redis } from 'ioredis';
import * as schema from 'src/database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';


const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class AuthService {
  constructor(
    @Inject('DRIZZLE_CLIENT') private readonly db: NodePgDatabase<typeof schema>,
    private logger: ISOLogger,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {
    this.logger.setContext(AuthService.name);
  }

  async validateApiKey(apiKey: string) {

    if (!UUID_REGEX.test(apiKey)) {
      return false;
    };

    const cached= await this.redis.get(`apikey:${apiKey}`);
    if (cached) {
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

    const exists= Boolean(result.rows[0]?.exists);

     if(exists){
       await this.redis.set(`apikey:${apiKey}`, '1', 'EX', 60 * 15);
     };

     return exists;

  }
}
