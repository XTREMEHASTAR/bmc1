import fs from 'fs';
const content = fs.readFileSync('c:\\Users\\jaiveer\\Downloads\\mcgm-digital-hospital\\src\\components\\EmergencyCareDashboard.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('triage') || line.includes('GCS') || line.includes('RTS')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
