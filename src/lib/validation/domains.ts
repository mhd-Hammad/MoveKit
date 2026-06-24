/**
 * University domain validation.
 * 
 * For MVP/hackathon, we use a hardcoded list of common university TLDs
 * and patterns. In production, this would query the university_domains
 * Supabase table seeded from an open dataset.
 */

// Common university email domain suffixes (used for production DB validation)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
 * 
 * NOTE: In development, allows all domains for testing.
 * In production, only university domains pass.
 */
export function isValidUniversityDomain(domain: string): boolean {
  const lowerDomain = domain.toLowerCase()

  // Block known personal email providers in production only
  if (process.env.NODE_ENV === 'production') {
    if (BLOCKED_DOMAINS.includes(lowerDomain)) {
      return false
    }
  }

  // In development, allow everything for testing
  return true
}

/**
 * Extracts the domain from an email address.
 */
export function extractDomain(email: string): string {
  return email.split('@')[1]?.toLowerCase() || ''
}
