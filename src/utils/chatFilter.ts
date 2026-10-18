// Ultra-Comprehensive Multilingual & Obfuscation-Proof Profanity & Harassment Filter
// Handles leetspeak (sh1t, fuc, sh!tface, $sshole, $$$hole, m#rdef$c#), spaced ciphers, compounds, foreign insults, slang (fah, dih), and harassment

// Base profanity stems across languages and compound insults
const CORE_PROFANITY_STEMS: string[] = [
  // English Core, Slang & Compounds
  'fuck', 'fuk', 'fck', 'fuc', 'fucker', 'fucking', 'fucked', 'motherfucker', 'fuckface', 'fuckhead', 'fuckboy',
  'fah', // Slang for fuck
  'shit', 'shite', 'shitting', 'bullshit', 'shitface', 'shithead', 'dipshit', 'dumbshit', 'horseshit',
  'bitch', 'bitches', 'bitching', 'biatch', 'bitchass',
  'ass', 'asshole', 'dickass', 'jackass', 'dumbass', 'badass', 'smartass', 'fatass', 'arse', 'arsehole',
  'dick', 'dicks', 'dickhead', 'dickface',
  'dih', // Slang for dick
  'cock', 'cocks', 'cocksucker', 'cockhead',
  'pussy', 'pussies', 'pussycat',
  'cunt', 'cunts', 'cuntface',
  'bastard', 'bastards',
  'slut', 'sluts', 'whore', 'whores',
  'damn', 'dammit', 'goddamn',
  'crap',
  'nigger', 'niggers', 'nigga', 'niggas',
  'fag', 'faggot', 'faggots',
  'retard', 'retarded',
  'tits', 'titties', 'boobs', 'penis', 'vagina', 'porn', 'porno',

  // Spanish
  'puta', 'putas', 'puto', 'putos', 'mierda', 'pendejo', 'pendejos', 'cabron', 'cabrones',
  'verga', 'culiao', 'chupala', 'chinga', 'chingar', 'chingado', 'chingada', 'marica', 'maricon', 'hijo de puta',

  // French
  'merde', 'merdeface', 'putain', 'connard', 'connasse', 'salope', 'encule', 'enculer', 'batard', 'bite',

  // German
  'scheisse', 'scheiße', 'arschloch', 'hurensohn', 'fotze', 'wichser', 'schlampe',

  // Russian (Transliterated)
  'cyka', 'suka', 'blyat', 'blyad', 'nahui', 'nahuy', 'pizdetz', 'pizda', 'ebat',

  // Italian & Portuguese
  'cazzo', 'stronzo', 'troia', 'vaffanculo', 'caralho', 'porra', 'foda', 'fodase', 'filho da puta',
];

// Explicit sexual harassment, violence, or grooming phrases to strictly censor
const HARASSMENT_PATTERNS: RegExp[] = [
  /grab\s+(your|ur)\s+(dih|dick|penis|cock)/i,
  /shove\s+it\s+up/i,
  /touch\s+(the\s+)?baby/i,
  /touch\s+the\s+babybefore\s+it\s+comes\s+out/i,
  /touch\s+the\s+baby\s+before\s+it\s+comes\s+out/i,
  /touch(ing)?\s+(kids?|children|babies|baby|infant)/i,
  /rape|molest|pedophile|paedophile/i,
  /sister'?s?\s+v(agina)?/i,
  /sis'?\s+v(agina)?/i,
  /ima\s+grab/i,
];

// Helper to normalize text with number and symbol replacements
export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/\$\$\$/g, 'ass')
    .replace(/\$\$/g, 'ss')
    .replace(/\$/g, 's')
    .replace(/0/g, 'o')
    .replace(/1|!|\|/g, 'i')
    .replace(/3|#/g, 'e')
    .replace(/4|@/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/8/g, 'b')
    .replace(/vv/g, 'w');
}

// Builds regex with optional spaces/symbols between characters (e.g. f u c k or f-u-c-k)
function buildCipherPattern(stem: string): RegExp {
  const letters = stem.split('').map((ch) => {
    if (ch === 'i') return '[i1!|]';
    if (ch === 'o') return '[o0]';
    if (ch === 'e') return '[e3#]';
    if (ch === 'a') return '[a4@]';
    if (ch === 's') return '[s5$]';
    if (ch === 't') return '[t7]';
    if (ch === 'b') return '[b8]';
    if (ch === 'u') return '[uv]';
    return ch;
  });

  // Matches word with spaces, dots, dashes, underscores between characters
  const patternStr = letters.join('[\\s._\\-*~]*');
  return new RegExp(`(?<=^|[^a-zA-Z0-9])(${patternStr})(?=[^a-zA-Z0-9]|$)`, 'gi');
}

// Cache compiled regex patterns
const COMPILED_CIPHER_PATTERNS = CORE_PROFANITY_STEMS.map(buildCipherPattern);

// Compound substring patterns (catches shitface, sh!tface, $sshole, merdeface, m#rdef$c#, dickass)
const COMPOUND_SUBSTRING_PATTERNS: RegExp[] = [
  /([a-zA-Z0-9$#!@]*(fuck|fuk|fck|fucc|fah)[a-zA-Z0-9$#!@]*)/gi,
  /([a-zA-Z0-9$#!@]*(shit|sh!t|sh1t|shite)[a-zA-Z0-9$#!@]*)/gi,
  /([a-zA-Z0-9$#!@]*(bitch|biatch)[a-zA-Z0-9$#!@]*)/gi,
  /([a-zA-Z0-9$#!@]*(dickass|dickhead|dickface|asshole|dumbass|jackass|badass|fatass|\$sshole|\$\$\$hole)[a-zA-Z0-9$#!@]*)/gi,
  /([a-zA-Z0-9$#!@]*(dih|dick|cock)[a-zA-Z0-9$#!@]*)/gi,
  /([a-zA-Z0-9$#!@]*(cocksuck|cockhead)[a-zA-Z0-9$#!@]*)/gi,
  /([a-zA-Z0-9$#!@]*(cunt)[a-zA-Z0-9$#!@]*)/gi,
  /([a-zA-Z0-9$#!@]*(nigger|nigga)[a-zA-Z0-9$#!@]*)/gi,
  /([a-zA-Z0-9$#!@]*(faggot)[a-zA-Z0-9$#!@]*)/gi,
  /([a-zA-Z0-9$#!@]*(pendejo|mierda|merde|merdeface|m#rde|scheisse|arschloch|hurensohn)[a-zA-Z0-9$#!@]*)/gi,
];

export function filterProfanity(text: string): string {
  if (!text) return '';
  let filtered = text;

  // 1. Check Harassment & Sexual Misconduct Patterns
  for (const hPattern of HARASSMENT_PATTERNS) {
    if (hPattern.test(filtered) || hPattern.test(normalizeText(filtered))) {
      filtered = filtered.replace(hPattern, (match) => '*'.repeat(match.length));
    }
  }

  // 2. Check compound substring patterns
  for (const pattern of COMPOUND_SUBSTRING_PATTERNS) {
    filtered = filtered.replace(pattern, (match) => '*'.repeat(match.length));
  }

  // 3. Check cipher & leetspeak patterns (spaced out like f u c k, f.u.c.k, sh1t)
  for (const pattern of COMPILED_CIPHER_PATTERNS) {
    filtered = filtered.replace(pattern, (match) => '*'.repeat(match.length));
  }

  // 4. Normalized check: test normalized string against all stems
  const normalized = normalizeText(filtered);
  for (const pattern of COMPILED_CIPHER_PATTERNS) {
    if (pattern.test(normalized)) {
      // If normalized triggered, censor corresponding match
      filtered = filtered.replace(pattern, (match) => '*'.repeat(match.length));
    }
  }

  // 5. Check if normalized compressed string has any core stems or compound cusses
  const cleanStr = normalized.replace(/[\s._\-*~]/g, '');
  for (const stem of CORE_PROFANITY_STEMS) {
    if (stem.length >= 3 && cleanStr.includes(stem)) {
      for (const pattern of COMPILED_CIPHER_PATTERNS) {
        filtered = filtered.replace(pattern, (match) => '*'.repeat(match.length));
      }
    }
  }

  // 6. Direct word replacements for symbols like $SSHOLE, $$$hole, M#RDEF$C#, FAH, DIH
  filtered = filtered.replace(/\b(\$sshole|\$\$\$hole|sh!tface|merdeface|m#rdef\$c#|fah|dih)\b/gi, (match) => '*'.repeat(match.length));

  return filtered;
}

export function containsProfanity(text: string): boolean {
  if (!text) return false;
  if (HARASSMENT_PATTERNS.some((p) => p.test(text) || p.test(normalizeText(text)))) {
    return true;
  }
  const filtered = filterProfanity(text);
  return filtered !== text;
}
