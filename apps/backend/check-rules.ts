import { RulesRepository } from './src/modules/automations/rules.repository';

async function check() {
  const repo = new RulesRepository();
  const rules = await repo.findByAccountId('8bfcb229-dc12-4256-805c-fac7d16d7c05'); // The account ID from logs
  console.log('Total rules:', rules.length);
  for (const r of rules) {
    console.log(`- Rule ID: ${r.id}`);
    console.log(`  Keyword: "${r.triggerKeyword}"`);
    console.log(`  Target Media: ${r.targetMediaId || 'GLOBAL (Any)'}`);
    console.log(`  Is Default: ${r.isDefaultRule}`);
    console.log(`  Reply: ${r.replyCommentText}`);
    console.log('---');
  }
}

check().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
