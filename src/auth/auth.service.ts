import { Injectable } from '@nestjs/common';
import { DrizzleService } from 'src/database/drizzle.service';
import { apiKeys } from 'src/database/schema';
import { eq } from 'drizzle-orm';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class AuthService {
  constructor(private readonly databaseService: DrizzleService) {}

  async validateApiKey(apiKey: string) {
    if (!UUID_REGEX.test(apiKey)) {
      return false;
    }

    const [apiKeyExists] = await this.databaseService.db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.id, apiKey))
      .limit(1);


      // Return true if API key exists
      return !!apiKeyExists;
  }
}
