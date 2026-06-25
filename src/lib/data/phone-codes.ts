export interface PhoneCode {
  country: string
  code: string
  format: string // placeholder showing expected format
  minLength: number
  maxLength: number
}

export const phoneCodes: PhoneCode[] = [
  { country: "Pakistan", code: "+92", format: "3XX XXXXXXX", minLength: 10, maxLength: 10 },
  { country: "India", code: "+91", format: "XXXXX XXXXX", minLength: 10, maxLength: 10 },
  { country: "United States", code: "+1", format: "XXX XXX XXXX", minLength: 10, maxLength: 10 },
  { country: "United Kingdom", code: "+44", format: "XXXX XXXXXX", minLength: 10, maxLength: 11 },
  { country: "Canada", code: "+1", format: "XXX XXX XXXX", minLength: 10, maxLength: 10 },
  { country: "Australia", code: "+61", format: "XXX XXX XXX", minLength: 9, maxLength: 9 },
  { country: "Germany", code: "+49", format: "XXXX XXXXXXX", minLength: 10, maxLength: 12 },
  { country: "France", code: "+33", format: "X XX XX XX XX", minLength: 9, maxLength: 9 },
  { country: "UAE", code: "+971", format: "XX XXX XXXX", minLength: 9, maxLength: 9 },
  { country: "Saudi Arabia", code: "+966", format: "XX XXX XXXX", minLength: 9, maxLength: 9 },
  { country: "China", code: "+86", format: "XXX XXXX XXXX", minLength: 11, maxLength: 11 },
  { country: "Japan", code: "+81", format: "XX XXXX XXXX", minLength: 10, maxLength: 10 },
  { country: "South Korea", code: "+82", format: "XX XXXX XXXX", minLength: 10, maxLength: 11 },
  { country: "Singapore", code: "+65", format: "XXXX XXXX", minLength: 8, maxLength: 8 },
  { country: "Malaysia", code: "+60", format: "XX XXXX XXXX", minLength: 9, maxLength: 10 },
  { country: "Bangladesh", code: "+880", format: "XXXX XXXXXX", minLength: 10, maxLength: 10 },
  { country: "Turkey", code: "+90", format: "XXX XXX XXXX", minLength: 10, maxLength: 10 },
  { country: "Egypt", code: "+20", format: "XX XXXX XXXX", minLength: 10, maxLength: 10 },
  { country: "Nigeria", code: "+234", format: "XXX XXX XXXX", minLength: 10, maxLength: 10 },
  { country: "South Africa", code: "+27", format: "XX XXX XXXX", minLength: 9, maxLength: 9 },
  { country: "Netherlands", code: "+31", format: "X XXXX XXXX", minLength: 9, maxLength: 9 },
  { country: "Sweden", code: "+46", format: "XX XXX XXXX", minLength: 9, maxLength: 10 },
  { country: "Switzerland", code: "+41", format: "XX XXX XXXX", minLength: 9, maxLength: 9 },
  { country: "Italy", code: "+39", format: "XXX XXX XXXX", minLength: 10, maxLength: 10 },
  { country: "Spain", code: "+34", format: "XXX XXX XXX", minLength: 9, maxLength: 9 },
  { country: "Ireland", code: "+353", format: "XX XXX XXXX", minLength: 9, maxLength: 9 },
  { country: "New Zealand", code: "+64", format: "XX XXX XXXX", minLength: 9, maxLength: 10 },
  { country: "Hong Kong", code: "+852", format: "XXXX XXXX", minLength: 8, maxLength: 8 },
  { country: "Qatar", code: "+974", format: "XXXX XXXX", minLength: 8, maxLength: 8 },
  { country: "Kuwait", code: "+965", format: "XXXX XXXX", minLength: 8, maxLength: 8 },
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
