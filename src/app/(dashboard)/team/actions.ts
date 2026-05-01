'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireProjectAdminContext } from '@/lib/rbac'

function normalizeRole(role: string): 'admin' | 'member' {
  if (role === 'admin' || role === 'member') {
    return role
  }

  throw new Error('Invalid role.')
}

async function ensureAnotherAdmin(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  excludeUserId: string
) {
  const { count, error } = await supabase
    .from('project_members')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', projectId)
    .eq('role', 'admin')
    .neq('user_id', excludeUserId)

  if (error) throw new Error(error.message)
  if ((count ?? 0) < 1) {
    throw new Error('Project must keep at least one admin.')
  }
}

export async function inviteMember(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const projectId = formData.get('projectId') as string
  const role = normalizeRole((formData.get('role') as string) || 'member')

  if (!email) throw new Error('Email is required.')
  if (!projectId) throw new Error('Please select a project.')

  const projectAccess = await requireProjectAdminContext(projectId)
  if (!projectAccess.canManageProject) {
    throw new Error('Forbidden')
  }

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
  const { data: existing, error: existingError } = await supabase
    .from('project_members')
    .select('id')
    .eq('project_id', projectId)
    .eq('user_id', targetProfile.id)
    .maybeSingle()

  if (existingError) throw new Error(existingError.message)
  if (existing) throw new Error(`${email} is already a member of this project.`)

  // Add to project_members
  const { error } = await supabase
    .from('project_members')
    .insert({ project_id: projectId, user_id: targetProfile.id, role })

  if (error) throw new Error(error.message)

  revalidatePath('/team')
  revalidatePath(`/projects/${projectId}`)
  return { name: targetProfile.full_name ?? email }
}

export async function updateMemberRole(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const projectId = formData.get('projectId') as string
  const memberId = formData.get('memberId') as string
  const role = normalizeRole((formData.get('role') as string) || '')

  if (!projectId) throw new Error('Project is required.')
  if (!memberId) throw new Error('Member is required.')

  const projectAccess = await requireProjectAdminContext(projectId)
  if (!projectAccess.canManageProject) {
    throw new Error('Forbidden')
  }

  const { data: member, error: memberError } = await supabase
    .from('project_members')
    .select('id, user_id, role, projects(owner_id)')
    .eq('project_id', projectId)
    .eq('user_id', memberId)
    .single()

  if (memberError || !member) {
    throw new Error('Member not found.')
  }

  const project = member.projects as unknown as { owner_id: string | null } | null
  if (project?.owner_id === memberId) {
    throw new Error('Project owner role cannot be changed.')
  }

  if (member.role === 'admin' && role === 'member') {
    await ensureAnotherAdmin(supabase, projectId, memberId)
  }

  const { error } = await supabase
    .from('project_members')
    .update({ role })
    .eq('project_id', projectId)
    .eq('user_id', memberId)

  if (error) throw new Error(error.message)

  revalidatePath('/team')
  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

export async function removeMember(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const projectId = formData.get('projectId') as string
  const memberId = formData.get('memberId') as string

  if (!projectId) throw new Error('Project is required.')
  if (!memberId) throw new Error('Member is required.')

  const projectAccess = await requireProjectAdminContext(projectId)
  if (!projectAccess.canManageProject) {
    throw new Error('Forbidden')
  }

  const { data: member, error: memberError } = await supabase
    .from('project_members')
    .select('id, user_id, role, projects(owner_id)')
    .eq('project_id', projectId)
    .eq('user_id', memberId)
    .single()

  if (memberError || !member) {
    throw new Error('Member not found.')
  }

  const project = member.projects as unknown as { owner_id: string | null } | null
  if (project?.owner_id === memberId) {
    throw new Error('Project owner cannot be removed.')
  }

  if (member.role === 'admin') {
    await ensureAnotherAdmin(supabase, projectId, memberId)
  }

  const { error } = await supabase
    .from('project_members')
    .delete()
    .eq('project_id', projectId)
    .eq('user_id', memberId)

  if (error) throw new Error(error.message)

  revalidatePath('/team')
  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}
