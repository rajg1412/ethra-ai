'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function inviteMember(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const projectId = formData.get('projectId') as string
  const role = (formData.get('role') as string) || 'member'

  if (!email) throw new Error('Email is required.')
  if (!projectId) throw new Error('Please select a project.')

  // Find the user by email in profiles
  const { data: targetProfile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('email', email)
    .single()

  if (profileError || !targetProfile) {
    throw new Error(`No user found with email "${email}". They must sign up first.`)
  }

  // Check if already a member
  const { data: existing } = await supabase
    .from('project_members')
    .select('id')
    .eq('project_id', projectId)
    .eq('user_id', targetProfile.id)
    .single()

  if (existing) throw new Error(`${email} is already a member of this project.`)

  // Add to project_members
  const { error } = await supabase
    .from('project_members')
    .insert({ project_id: projectId, user_id: targetProfile.id, role })

  if (error) throw new Error(error.message)

  revalidatePath('/team')
  return { name: targetProfile.full_name ?? email }
}
