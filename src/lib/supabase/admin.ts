import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase admin client using the service role key.
 * This client bypasses Row-Level Security (RLS) and should ONLY be used
 * for privileged server-side operations such as:
 * - OTP management (creating/verifying OTP records)
 * - Admin actions (user management, dispute resolution)
 * - Trust score updates
 * - System-level operations
 * 
 * WARNING: Never expose this client or the service role key to the browser.
 * Only use in API routes and server-side code.
 * 
 * Usage:
 *   import { createAdminClient } from '@/lib/supabase/admin'
 *   const supabase = createAdminClient()
 */
export function createAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables. ' +
      'The admin client requires these server-side environment variables.'
    )
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
