import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set in frontend/.env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const email = process.argv[2]
if (!email) {
  console.error('Usage: node scripts/send_reset.mjs <email>')
  process.exit(1)
}

console.log('Sending password reset email to', email)

;(async () => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'http://localhost:5175/reset-password'
  })

  if (error) {
    console.error('Supabase error:', error.message)
    process.exit(2)
  }

  console.log('Reset email request sent successfully')
})()
