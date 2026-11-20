const fs = require('fs');
const path = require('path');

const tsvContent = fs.readFileSync(path.join(__dirname, 'test-cases.tsv'), 'utf-8');
const lines = tsvContent.split(/\r?\n/).filter(l => l.trim().length > 0);
const mapping = [];

for (let i = 1; i < lines.length; i++) {
  const cols = lines[i].split('\t');
  if (cols.length >= 17) {
    mapping.push({
      id: cols[0].trim(),
      file: cols[16].trim(),
      title: cols[6].trim()
    });
  }
}

const unitDir = path.join(__dirname, 'unit');
const unitFiles = fs.readdirSync(unitDir).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

let totalFound = 0;
let missing = [];

for (const tc of mapping) {
  let found = false;
  for (const f of unitFiles) {
    const content = fs.readFileSync(path.join(unitDir, f), 'utf-8');
    if (content.includes(`[${tc.id}]`)) {
      found = true;
      totalFound++;
      break;
    }
  }
  if (!found) {
    missing.push(tc);
  }
}

console.log(`Verified comments in test/unit: ${totalFound} / ${mapping.length}`);
if (missing.length > 0) {
  console.log('Missing:');
  missing.forEach(m => console.log(`  ${m.id}: ${m.title} (${m.file})`));
}
