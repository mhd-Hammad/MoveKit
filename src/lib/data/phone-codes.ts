export interface PhoneCode {
  country: string
  code: string
  format: string // placeholder showing expected format
  minLength: number
  maxLength: number
}

export const phoneCodes: PhoneCode[] = [
  { country: "PK", code: "+92", format: "3XX XXXXXXX", minLength: 10, maxLength: 10 },
  { country: "IN", code: "+91", format: "XXXXX XXXXX", minLength: 10, maxLength: 10 },
  { country: "US", code: "+1", format: "XXX XXX XXXX", minLength: 10, maxLength: 10 },
  { country: "UK", code: "+44", format: "XXXX XXXXXX", minLength: 10, maxLength: 11 },
  { country: "CA", code: "+1", format: "XXX XXX XXXX", minLength: 10, maxLength: 10 },
  { country: "AU", code: "+61", format: "XXX XXX XXX", minLength: 9, maxLength: 9 },
  { country: "DE", code: "+49", format: "XXXX XXXXXXX", minLength: 10, maxLength: 12 },
  { country: "FR", code: "+33", format: "X XX XX XX XX", minLength: 9, maxLength: 9 },
  { country: "AE", code: "+971", format: "XX XXX XXXX", minLength: 9, maxLength: 9 },
  { country: "SA", code: "+966", format: "XX XXX XXXX", minLength: 9, maxLength: 9 },
  { country: "CN", code: "+86", format: "XXX XXXX XXXX", minLength: 11, maxLength: 11 },
  { country: "JP", code: "+81", format: "XX XXXX XXXX", minLength: 10, maxLength: 10 },
  { country: "KR", code: "+82", format: "XX XXXX XXXX", minLength: 10, maxLength: 11 },
  { country: "SG", code: "+65", format: "XXXX XXXX", minLength: 8, maxLength: 8 },
  { country: "MY", code: "+60", format: "XX XXXX XXXX", minLength: 9, maxLength: 10 },
  { country: "BD", code: "+880", format: "XXXX XXXXXX", minLength: 10, maxLength: 10 },
  { country: "TR", code: "+90", format: "XXX XXX XXXX", minLength: 10, maxLength: 10 },
  { country: "EG", code: "+20", format: "XX XXXX XXXX", minLength: 10, maxLength: 10 },
  { country: "NG", code: "+234", format: "XXX XXX XXXX", minLength: 10, maxLength: 10 },
  { country: "ZA", code: "+27", format: "XX XXX XXXX", minLength: 9, maxLength: 9 },
  { country: "NL", code: "+31", format: "X XXXX XXXX", minLength: 9, maxLength: 9 },
  { country: "SE", code: "+46", format: "XX XXX XXXX", minLength: 9, maxLength: 10 },
  { country: "CH", code: "+41", format: "XX XXX XXXX", minLength: 9, maxLength: 9 },
  { country: "IT", code: "+39", format: "XXX XXX XXXX", minLength: 10, maxLength: 10 },
  { country: "ES", code: "+34", format: "XXX XXX XXX", minLength: 9, maxLength: 9 },
  { country: "IE", code: "+353", format: "XX XXX XXXX", minLength: 9, maxLength: 9 },
  { country: "NZ", code: "+64", format: "XX XXX XXXX", minLength: 9, maxLength: 10 },
  { country: "HK", code: "+852", format: "XXXX XXXX", minLength: 8, maxLength: 8 },
  { country: "QA", code: "+974", format: "XXXX XXXX", minLength: 8, maxLength: 8 },
  { country: "KW", code: "+965", format: "XXXX XXXX", minLength: 8, maxLength: 8 },
]

/**
 * Validates a phone number against country format.
 */
export function validatePhoneNumber(digits: string, code: PhoneCode): { valid: boolean; error?: string } {
  const cleaned = digits.replace(/\D/g, '')
  
  if (cleaned.length < code.minLength) {
    return { valid: false, error: `Phone number must be at least ${code.minLength} digits for ${code.country}` }
  }
  if (cleaned.length > code.maxLength) {
    return { valid: false, error: `Phone number must be at most ${code.maxLength} digits for ${code.country}` }
  }
  
  return { valid: true }
}
