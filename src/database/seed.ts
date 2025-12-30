import 'dotenv/config';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { eq } from 'drizzle-orm';


  // npm run db:seed

const generateApiKey = (): string => crypto.randomUUID();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

const db = drizzle(pool, { schema });

async function seed() {
  const email = 'demo@company.com';  // update

 const existing = await db.query.companies.findFirst({
    where: eq(schema.companies.email, email),
  });

  if (existing) {
    console.log('Company already exists, skipping');
    return;
  }

  const passwordHash = await bcrypt.hash('admin@123', 10);  //update

  const [company] = await db
    .insert(schema.companies)
    .values({
      name: 'Demo Company',   //update
      email,
      passwordHash,
      apiKey: generateApiKey(),
      active: true,
    })
    .returning();

  console.log('Company created:', company);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  });

