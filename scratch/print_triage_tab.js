import fs from 'fs';
const content = fs.readFileSync('c:\\Users\\jaiveer\\Downloads\\mcgm-digital-hospital\\src\\components\\EmergencyCareDashboard.tsx', 'utf8');
const lines = content.split('\n');
let active = false;
let braceCount = 0;
lines.forEach((line, idx) => {
  if (line.includes("activeSection === 'triage'")) {
    active = true;
  }
  if (active) {
    console.log(`${idx + 1}: ${line}`);
    if (line.includes('{')) braceCount += (line.match(/{/g) || []).length;
    if (line.includes('}')) braceCount -= (line.match(/}/g) || []).length;
    if (braceCount < 0) { // end of block
      active = false;
    }
  }
});
