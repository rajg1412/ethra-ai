'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function inviteMember(projectId: string, email: string, role: 'admin' | 'member' = 'member') {
  const supabase = await createClient()
  
  // Find user by email
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (profileError || !profile) {
    throw new Error('User not found. They must sign up first.')
  }

  // Add to project_members
  const { error: inviteError } = await supabase
    .from('project_members')
    .insert({
      project_id: projectId,
      user_id: profile.id,
      role
    })

  if (inviteError) {
    if (inviteError.code === '23505') throw new Error('User is already a member of this project.')
    throw new Error(inviteError.message)
  }

  revalidatePath('/team')
  revalidatePath(`/projects/${projectId}`)
}

export async function removeMember(projectId: string, userId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('project_members')
    .delete()
    .eq('project_id', projectId)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
  revalidatePath('/team')
}

export async function updateMemberRole(projectId: string, userId: string, role: 'admin' | 'member') {
  const supabase = await createClient()
  const { error } = await supabase
    .from('project_members')
    .update({ role })
    .eq('project_id', projectId)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
  revalidatePath('/team')
}
