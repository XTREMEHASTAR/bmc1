import fs from 'fs';
const content = fs.readFileSync('c:\\Users\\jaiveer\\Downloads\\mcgm-digital-hospital\\src\\components\\EmergencyCareDashboard.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('Modal') || line.includes('modal') || line.includes('dialog') || line.includes('Dialog') || line.includes('newPatientInput')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
