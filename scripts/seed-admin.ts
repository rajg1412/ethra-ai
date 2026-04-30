import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY // Use service role for admin tasks

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase URL or Service Role Key in .env')
  process.exit(1)
}

// Create a Supabase client with the SERVICE ROLE key to bypass RLS and manage users
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function seedAdmin() {
  const email = 'admin@gmail.com'
  const password = '12345678'
  const fullName = 'System Admin'

  console.log(`Checking if admin user ${email} exists...`)

  try {
    // 1. Try to create the user in Auth
    console.log('Creating auth user...')
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm
      user_metadata: { full_name: fullName }
    })

    let userId = authData?.user?.id

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('User already exists. Fetching existing user ID...')
        // Fetch existing users (requires service role)
        const { data: listData, error: listError } = await supabase.auth.admin.listUsers()
        if (listError) throw listError
        
        const existingUser = listData.users.find(u => u.email === email)
        if (existingUser) {
           userId = existingUser.id
           console.log(`Found existing user ID: ${userId}`)
        } else {
            throw new Error("User says already registered but couldn't find in list.")
        }
      } else {
         throw authError
      }
    } else {
         console.log(`Created new auth user with ID: ${userId}`)
    }

    if (!userId) throw new Error('Could not determine user ID.')

    // 2. Wait a moment for the trigger to fire and create the profile
    console.log('Waiting for profile trigger...')
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 3. Update the profile to make them an admin
    console.log('Promoting profile to admin...')
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', userId)

    if (profileError) {
      // If the trigger failed for some reason, insert manually
       console.log('Update failed, trying manual insert...')
       const { error: insertError } = await supabase.from('profiles').insert({
           id: userId,
           email: email,
           full_name: fullName,
           is_admin: true
       })
       if (insertError) throw insertError
    }

    console.log('\n✅ Success! Admin user created/updated.')
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)
    console.log(`Admin Status: Active`)

  } catch (error) {
    console.error('\n❌ Error seeding admin:', error)
  }
}

seedAdmin()
