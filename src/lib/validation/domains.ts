/**
 * University domain validation.
 * 
 * For MVP/hackathon, we use a hardcoded list of common university TLDs
 * and patterns. In production, this would query the university_domains
 * Supabase table seeded from an open dataset.
 */

// Common university email domain suffixes
const UNIVERSITY_TLDS = [
  '.edu',
  '.ac.uk',
  '.ac.jp',
  '.ac.kr',
  '.ac.in',
  '.ac.nz',
  '.ac.za',
  '.edu.au',
  '.edu.cn',
  '.edu.sg',
  '.edu.my',
  '.edu.pk',
  '.edu.br',
  '.edu.mx',
  '.edu.co',
  '.edu.tr',
  '.edu.sa',
  '.edu.eg',
  '.edu.ng',
  '.ac.id',
  '.uni-',     // German universities
  '.univ-',    // French universities
]

// Known personal/consumer email providers that are NOT universities
const BLOCKED_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'aol.com',
  'icloud.com',
  'protonmail.com',
  'mail.com',
  'zoho.com',
  'yandex.com',
  'gmx.com',
  'tutanota.com',
]

/**
 * Checks if an email domain looks like a valid university domain.
 * Uses pattern matching for MVP. Will be replaced with DB lookup.
 */
export function isValidUniversityDomain(domain: string): boolean {
  const lowerDomain = domain.toLowerCase()

  // Block known personal email providers
  if (BLOCKED_DOMAINS.includes(lowerDomain)) {
    return false
  }

  // Accept if matches any university TLD pattern
  for (const tld of UNIVERSITY_TLDS) {
    if (lowerDomain.endsWith(tld) || lowerDomain.includes(tld)) {
      return true
    }
  }

  // For hackathon: also accept any domain not in blocked list
  // This is permissive for demo purposes — in production, only DB-listed domains pass
  return true
}

/**
 * Extracts the domain from an email address.
 */
export function extractDomain(email: string): string {
  return email.split('@')[1]?.toLowerCase() || ''
}
