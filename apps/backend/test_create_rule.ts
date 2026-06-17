import { RulesService } from './src/modules/automations/rules.service';
import { db } from './src/database/db';
import { connectedAccounts } from './src/database/schema';

async function main() {
  try {
    const rulesService = new RulesService();
    const accountId = '623d4eaf-e5ce-4920-9acd-23a160ba5d19';
    
    // find user
    const accounts = await db.select().from(connectedAccounts);
    const account = accounts.find(a => a.id === accountId);
    if (!account) {
      console.log('Account not found in db');
      return process.exit(0);
    }

    const payload = {
      accountId: accountId,
      triggerType: 'exact',
      triggerKeyword: 'TESTKEYWORD123',
      targetMediaId: null,
      isDefaultRule: false,
      replyCommentText: 'hello',
      dmTemplateText: 'world',
      isActive: true
    };

    const rule = await rulesService.createRule(account.userId as string, payload);
    console.log('Success:', rule);
  } catch (err: any) {
    console.error('ERROR MESSAGE:', err.message);
    console.log('ERROR JSON LENGTH:', JSON.stringify({error: err.message}).length);
  } finally {
    process.exit(0);
  }
}
main();
