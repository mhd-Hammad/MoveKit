/**
 * Verification tier system for MoveKit.
 * 
 * Tiers (progressive):
 * - basic: Email verified only → Can browse, view marketplace, generate blueprint
 * - phone: Phone number provided → Can start chats, propose deals
 * - document: Student card/offer letter verified → Can list items, accept deals
 * - full: Location + document → Complete transaction access
 */

export type VerificationTier = 'basic' | 'phone' | 'document' | 'full'

export interface VerificationRequirement {
  action: string
  requiredTier: VerificationTier
  message: string
}

// Actions and their required verification tier
export const ACTION_REQUIREMENTS: VerificationRequirement[] = [
  // Basic (email only) — free to do
  { action: 'browse_marketplace', requiredTier: 'basic', message: '' },
  { action: 'generate_blueprint', requiredTier: 'basic', message: '' },
  { action: 'view_listings', requiredTier: 'basic', message: '' },
  { action: 'view_tips', requiredTier: 'basic', message: '' },

  // Phone required — need accountability
  { action: 'start_chat', requiredTier: 'phone', message: 'Add your phone number to start chatting with sellers.' },
  { action: 'propose_deal', requiredTier: 'phone', message: 'Add your phone number to propose deals.' },
  { action: 'submit_tip', requiredTier: 'phone', message: 'Add your phone number to contribute tips.' },

  // Document required — full trust needed
  { action: 'create_listing', requiredTier: 'document', message: 'Verify your student identity to list items.' },
  { action: 'accept_deal', requiredTier: 'document', message: 'Verify your student identity to accept deals.' },
  { action: 'confirm_deal', requiredTier: 'phone', message: 'Add your phone number to confirm exchanges.' },
]

/**
 * Check if a user's current tier meets the requirement for an action.
 */
export function canPerformAction(
  userTier: VerificationTier,
  action: string
): { allowed: boolean; message: string } {
  const tierOrder: VerificationTier[] = ['basic', 'phone', 'document', 'full']
  const requirement = ACTION_REQUIREMENTS.find(r => r.action === action)

  if (!requirement) return { allowed: true, message: '' }

  const userLevel = tierOrder.indexOf(userTier)
  const requiredLevel = tierOrder.indexOf(requirement.requiredTier)

  if (userLevel >= requiredLevel) {
    return { allowed: true, message: '' }
  }

  return { allowed: false, message: requirement.message }
}

/**
 * Compute the user's current verification tier based on their flags.
 */
export function computeVerificationTier(user: {
  email_verified: boolean
  phone_number?: string
  phone_verified?: boolean
  document_verified: boolean
  location_verified: boolean
}): VerificationTier {
  if (user.document_verified && user.location_verified) return 'full'
  if (user.document_verified) return 'document'
  if (user.phone_number && user.phone_number.length > 5) return 'phone'
  return 'basic'
}
