import { db, initDatabase } from './src/database/db';
import { users } from './src/database/schema';
import argon2 from 'argon2';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';

async function createReviewer() {
  await initDatabase();
  const email = 'reviewer@test.com';
  
  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    console.log('Reviewer account already exists!');
    process.exit(0);
  }

  const hashedPassword = await argon2.hash('Password123');
  await db.insert(users).values({
    id: randomUUID(),
    email,
    passwordHash: hashedPassword,
    name: 'Meta Reviewer'
  });
  
  console.log('Created reviewer@test.com account with password: Password123');
  process.exit(0);
}

createReviewer().catch(console.error);
