import { Injectable } from '@nestjs/common';
import { DrizzleService } from 'src/database/drizzle.service';
import { ISOLogger } from 'src/logger/iso-logger.service';
import { sql } from 'drizzle-orm';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DrizzleService,
    private logger: ISOLogger,
  ) {
    this.logger.setContext(AuthService.name);
  }

  async validateApiKey(apiKey: string) {
    apiKey = apiKey?.toString().trim();
    if (!UUID_REGEX.test(apiKey)) {
      return false;
    }

    const result = await this.databaseService.db.execute(
      sql`
      select exists (
        select 1
        from companies
        where api_key = ${apiKey}
      ) as exists
    `,
    );

    return Boolean(result.rows[0]?.exists);
  }
}
