import fs from 'fs';
const content = fs.readFileSync('c:\\Users\\jaiveer\\Downloads\\mcgm-digital-hospital\\src\\components\\EmergencyCareDashboard.tsx', 'utf8');
const lines = content.split('\n');
for (let i = 1630; i < lines.length; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
