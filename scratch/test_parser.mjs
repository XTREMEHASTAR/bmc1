// Test the parseVoiceTranscript logic (extracted from EmergencyCareDashboard.tsx)
const parseVoiceTranscript = (raw) => {
  // Normalize transcript: split digit↔letter joins ("24b" → "24 b", "30years" → "30 years")
  const rawNorm = raw
    .replace(/(\d)([a-zA-Z])/g, '$1 $2')
    .replace(/([a-zA-Z])(\d)/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();

  const t = rawNorm.toLowerCase().replace(/[.,!?]/g, '');
  const parsed = {};
  const capitalize = (s) => s.replace(/\b\w/g, c => c.toUpperCase());

  // Gender
  if (/\b(female|woman|lady|girl|mahila|aurat|stree)\b/.test(t)) parsed.gender = 'Female';
  else if (/\b(male|man|boy|aadmi|purush)\b/.test(t)) parsed.gender = 'Male';
  else parsed.gender = 'Male';

  // Blood Group
  if (/\b(o\s*positive|o\s*pos)\b/.test(t)) parsed.blood_group = 'O Positive';
  else if (/\b(o\s*negative|o\s*neg)\b/.test(t)) parsed.blood_group = 'O Negative';
  else if (/\b(ab\s*positive|ab\s*pos)\b/.test(t)) parsed.blood_group = 'AB Positive';
  else if (/\b(ab\s*negative|ab\s*neg)\b/.test(t)) parsed.blood_group = 'AB Negative';
  else if (/\b(a\s*positive|a\s*pos)\b/.test(t)) parsed.blood_group = 'A Positive';
  else if (/\b(a\s*negative|a\s*neg)\b/.test(t)) parsed.blood_group = 'A Negative';
  else if (/\b(b\s*positive|b\s*pos|be\s*positive|be\s*pos|bee\s*positive|bee\s*pos)\b/.test(t)) parsed.blood_group = 'B Positive';
  else if (/\b(b\s*negative|b\s*neg|be\s*negative|be\s*neg|bee\s*negative)\b/.test(t)) parsed.blood_group = 'B Negative';

  // Clean prefix
  let cleanRaw = rawNorm.trim();
  cleanRaw = cleanRaw.replace(/^(register\s+patient|register\s+emergency\s+patient|register\s+new\s+patient|register|admit\s+patient|admit|patient\s+name\s+is|patient\s+is|patient)\s+/i, '');

  // Age
  const ageWordMap = {
    ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
    sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
    'twenty-five': 25, thirty: 30, 'thirty-five': 35, forty: 40,
    'forty-five': 45, fifty: 50, 'fifty-five': 55, sixty: 60,
    'sixty-five': 65, seventy: 70, 'seventy-five': 75, eighty: 80,
  };
  const ageNumMatch = t.match(/\b(?:age[d]?\s*|aged?\s+)(\d{1,3})\b/);
  if (ageNumMatch) {
    parsed.age = ageNumMatch[1];
  } else {
    const digitMatch = t.match(/\b(\d{1,2})\s*(?:year|sal|saal|yr|old)s?\b/);
    if (digitMatch) {
      parsed.age = digitMatch[1];
    } else {
      for (const [word, num] of Object.entries(ageWordMap)) {
        if (t.includes(word)) { parsed.age = String(num); break; }
      }
    }
  }
  if (!parsed.age) {
    const bareNum = t.match(/\b(\d{1,3})\b/);
    if (bareNum && Number(bareNum[1]) >= 1 && Number(bareNum[1]) <= 120) {
      parsed.age = bareNum[1];
    }
  }

  // Name extraction
  let nameCandidate = '';
  const nameAgePattern1 = cleanRaw.match(/^([A-Za-z\s]+?)\s+(\d{1,3})\b/);
  const nameAgePattern2 = cleanRaw.match(/^([A-Za-z\s]+?)\s+(?:aged?\s+|age\s+is\s+)(\d{1,3})\b/i);
  const ageWordPattern = Object.keys(ageWordMap).join('|');
  const nameAgePattern3 = cleanRaw.match(new RegExp(`^([A-Za-z\\s]+?)\\s+(?:aged?\\s+|age\\s+is\\s+)?(${ageWordPattern})\\b`, 'i'));

  if (nameAgePattern2) {
    nameCandidate = nameAgePattern2[1].trim();
    if (!parsed.age) parsed.age = nameAgePattern2[2];
  } else if (nameAgePattern1) {
    nameCandidate = nameAgePattern1[1].trim();
    if (!parsed.age) parsed.age = nameAgePattern1[2];
  } else if (nameAgePattern3) {
    nameCandidate = nameAgePattern3[1].trim();
    if (!parsed.age) {
      const numVal = ageWordMap[nameAgePattern3[2].toLowerCase()];
      if (numVal) parsed.age = String(numVal);
    }
  }

  // Fallback name patterns
  if (!nameCandidate) {
    const namePatterns = [
      /(?:patient|naam|name)\s+(?:is\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})/i,
      /(?:register|admit)\s+(?:patient\s+|emergency\s+patient\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})/i,
    ];
    for (const pat of namePatterns) {
      const m = rawNorm.match(pat);
      if (m) { nameCandidate = m[1].trim(); break; }
    }
  }

  // Clean name
  if (nameCandidate) {
    const stopWords = ['male','female','aged','age','year','old','brought','by','unknown','from','with','suffering','complaining','road','accident','ambulance','police','private','walk','in','unconscious','conscious','chest','pain','breathing','critical','urgent','minor','emergency','patient','register','admit','be','positive','negative','having','feeling','like','b','a','o','ab','is','and','the','of','for','not','but','yet','still','feels','last','night','since','bit','bitgidi'];
    const cleaned = nameCandidate.split(/\s+/).filter(w => !stopWords.includes(w.toLowerCase())).join(' ');
    if (cleaned.length >= 2) parsed.name = capitalize(cleaned);
  }

  // Consciousness
  if (/\b(unconscious|unresponsive|comatose|not\s+responding)\b/.test(t)) { parsed.conscious = 'No'; parsed.gcs = '6'; }
  else if (/\b(semi.?conscious|drowsy|altered)\b/.test(t)) { parsed.conscious = 'Yes'; parsed.gcs = '10'; }
  else if (/\b(conscious|responsive|awake|alert)\b/.test(t)) { parsed.conscious = 'Yes'; parsed.gcs = '15'; }

  return parsed;
};

// ===== RUN TESTS =====
const tests = [
  'Jay Veer Dube 24b positive having stomach ache from last night is conscious and still feels a bitgidi',
  'Jay Veer Dubey 24 be positive conscious having stomach ache',
  'Register emergency patient Sunita Deshmukh aged fifty brought by ambulance suffering severe chest pain',
  'Register unknown male approximately thirty years old brought by police after fall unconscious',
  'Rahul Kumar 30 o positive pulse 90 bp 120 80',
];

for (const test of tests) {
  console.log('─'.repeat(80));
  console.log('INPUT:', test);
  const result = parseVoiceTranscript(test);
  console.log('PARSED:', JSON.stringify(result, null, 2));
  console.log();
}
