import { db } from './src/database/db';
import { users } from './src/database/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function resetPassword() {
  // 1. Put your friend's email address here
  const targetEmail = 'friend@example.com'; 
  
  // 2. This will be their new temporary password
  const newPassword = 'password123'; 
  
  console.log(`Hashing new password for ${targetEmail}...`);
  const newHash = await bcrypt.hash(newPassword, 10);
  
  const result = await db.update(users)
    .set({ passwordHash: newHash })
    .where(eq(users.email, targetEmail));
    
  console.log(`✅ Successfully reset password for ${targetEmail} to: ${newPassword}`);
  console.log('Tell your friend to login with this new password!');
  process.exit(0);
}

resetPassword().catch(console.error);
