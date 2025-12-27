import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import { eq } from "drizzle-orm"
import { randomUUID } from "crypto"
import * as schema from "./schema"
import { apiKeys, applications} from "./schema"
import { config } from 'dotenv';

config();

async function main(){

    const pool=new Pool({
        connectionString: process.env.DATABASE_URL!,
    });

    const db = drizzle(pool, {schema });


    try {

        const [existingApp]=await db
            .select()
            .from(applications)
            .where(eq(applications.name, 'organizer'))
            .limit(1)

            if(existingApp){
                return;
            };

            const [app]=await db
                .insert(applications)
                .values({
                    name: 'organizer'
                })
                .returning();

            await db.insert(apiKeys).values({
                id: randomUUID(),
                applicationId: app.id
            });

            
    } catch (error) {
         process.exit(1);
    } finally{
        await pool.end();
    }

   //  0a193adf-3505-4eb5-8e54-e5378528beea
};

main();