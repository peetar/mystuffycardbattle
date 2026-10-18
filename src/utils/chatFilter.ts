// Profanity & bad words filter for plushie-safe chat

const PROFANITY_PATTERNS: RegExp[] = [
  /\b(fuck|fucker|fucking|fucked|fuk|fck|fucc)\b/gi,
  /\b(shit|shite|shitting|shat|bullshit)\b/gi,
  /\b(bitch|bitches|bitching|biatch)\b/gi,
  /\b(ass|asshole|arse|dumbass|jackass)\b/gi,
  /\b(dick|dicks|dickhead)\b/gi,
  /\b(cock|cocks|cocksucker)\b/gi,
  /\b(pussy|pussies)\b/gi,
  /\b(cunt|cunts)\b/gi,
  /\b(bastard|bastards)\b/gi,
  /\b(damn|dammit)\b/gi,
  /\b(crap)\b/gi,
  /\b(slut|sluts|whore|whores)\b/gi,
  /\b(nigger|niggers|nigga|niggas)\b/gi,
  /\b(fag|faggot|faggots)\b/gi,
  /\b(retard|retarded)\b/gi,
  /\b(tits|boobs)\b/gi,
];

// Replaces profanity with squeaky plushie asterisks or [squeak]
export function filterProfanity(text: string): string {
  if (!text) return '';
  let filtered = text;

  for (const pattern of PROFANITY_PATTERNS) {
    filtered = filtered.replace(pattern, (match) => {
      // Return plushie censor stars
      return '*'.repeat(match.length);
    });
  }

  return filtered;
}

export function containsProfanity(text: string): boolean {
  if (!text) return false;
  return PROFANITY_PATTERNS.some((pattern) => pattern.test(text));
}
