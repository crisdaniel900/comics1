#!/usr/bin/env node
/*
  Script seguro para enviar correo de restablecimiento usando la
  SUPABASE_SERVICE_ROLE_KEY desde el archivo .env raíz.
  Uso: node scripts/send_reset_server.mjs user@example.com
*/
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set in root .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false }
})

const email = process.argv[2]
if (!email) {
  console.error('Usage: node scripts/send_reset_server.mjs <email>')
  process.exit(1)
}

(async () => {
  try {
    console.log('Requesting password reset email for:', email)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:5175/reset-password'
    })

    if (error) {
      console.error('Supabase error:', error.message)
      process.exit(2)
    }

    console.log('Reset email request sent successfully')
  } catch (err) {
    console.error('Unexpected error:', err?.message || err)
    process.exit(3)
  }
})()
