import fs from 'fs';
const content = fs.readFileSync('c:\\Users\\jaiveer\\Downloads\\mcgm-digital-hospital\\src\\types\\emergency.ts', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('Resource')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
