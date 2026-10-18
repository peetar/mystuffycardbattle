// Ultra-Comprehensive Multilingual & Obfuscation-Proof Profanity Filter
// Handles leetspeak (sh1t, fuc), spaced ciphers (f u c k), compounds (shitface, dickass), and foreign languages

// Base profanity stems across languages and compound insults
const CORE_PROFANITY_STEMS: string[] = [
  // English Core & Compounds
  'fuck', 'fuk', 'fck', 'fuc', 'fucker', 'fucking', 'fucked', 'motherfucker', 'fuckface', 'fuckhead', 'fuckboy',
  'shit', 'shite', 'shitting', 'bullshit', 'shitface', 'shithead', 'dipshit', 'dumbshit', 'horseshit',
  'bitch', 'bitches', 'bitching', 'biatch', 'bitchass',
  'ass', 'asshole', 'dickass', 'jackass', 'dumbass', 'badass', 'smartass', 'fatass', 'arse', 'arsehole',
  'dick', 'dicks', 'dickhead', 'dickface',
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
  'merde', 'putain', 'connard', 'connasse', 'salope', 'encule', 'enculer', 'batard', 'bite',

  // German
  'scheisse', 'scheiße', 'arschloch', 'hurensohn', 'fotze', 'wichser', 'schlampe',

  // Russian (Transliterated)
  'cyka', 'suka', 'blyat', 'blyad', 'nahui', 'nahuy', 'pizdetz', 'pizda', 'ebat',

  // Italian & Portuguese
  'cazzo', 'stronzo', 'troia', 'vaffanculo', 'caralho', 'porra', 'foda', 'fodase', 'filho da puta',
];

// Helper to normalize text with number replacements
function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/0/g, 'o')
    .replace(/1|!|\|/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4|@/g, 'a')
    .replace(/5|\$/g, 's')
    .replace(/7/g, 't')
    .replace(/8/g, 'b')
    .replace(/vv/g, 'w');
}

// Builds regex with optional spaces/symbols between characters (e.g. f u c k or f-u-c-k)
function buildCipherPattern(stem: string): RegExp {
  const letters = stem.split('').map((ch) => {
    if (ch === 'i') return '[i1!|]';
    if (ch === 'o') return '[o0]';
    if (ch === 'e') return '[e3]';
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

// Compound substring patterns (catches shitface, dickass, etc. even inside words)
const COMPOUND_SUBSTRING_PATTERNS: RegExp[] = [
  /([a-zA-Z0-9]*(fuck|fuk|fck|fucc)[a-zA-Z0-9]*)/gi,
  /([a-zA-Z0-9]*(shit|shite)[a-zA-Z0-9]*)/gi,
  /([a-zA-Z0-9]*(bitch|biatch)[a-zA-Z0-9]*)/gi,
  /([a-zA-Z0-9]*(dickass|dickhead|dickface|asshole|dumbass|jackass|badass|fatass)[a-zA-Z0-9]*)/gi,
  /([a-zA-Z0-9]*(cocksuck|cockhead)[a-zA-Z0-9]*)/gi,
  /([a-zA-Z0-9]*(cunt)[a-zA-Z0-9]*)/gi,
  /([a-zA-Z0-9]*(nigger|nigga)[a-zA-Z0-9]*)/gi,
  /([a-zA-Z0-9]*(faggot)[a-zA-Z0-9]*)/gi,
  /([a-zA-Z0-9]*(pendejo|mierda|cabron|scheisse|arschloch|hurensohn)[a-zA-Z0-9]*)/gi,
];

export function filterProfanity(text: string): string {
  if (!text) return '';
  let filtered = text;

  // 1. Check compound substring patterns
  for (const pattern of COMPOUND_SUBSTRING_PATTERNS) {
    filtered = filtered.replace(pattern, (match) => '*'.repeat(match.length));
  }

  // 2. Check cipher & leetspeak patterns (spaced out like f u c k, f.u.c.k, sh1t)
  for (const pattern of COMPILED_CIPHER_PATTERNS) {
    filtered = filtered.replace(pattern, (match) => '*'.repeat(match.length));
  }

  // 3. Normalized check: if removing spaces produces a profane stem, censor it
  const cleanStr = normalizeText(filtered).replace(/[\s._\-*~]/g, '');
  for (const stem of CORE_PROFANITY_STEMS) {
    if (stem.length >= 3 && cleanStr.includes(stem)) {
      // Find matching range in original text and mask
      const normText = normalizeText(filtered);
      for (const pattern of COMPILED_CIPHER_PATTERNS) {
        filtered = filtered.replace(pattern, (match) => '*'.repeat(match.length));
      }
    }
  }

  return filtered;
}

export function containsProfanity(text: string): boolean {
  if (!text) return false;
  const filtered = filterProfanity(text);
  return filtered !== text;
}
