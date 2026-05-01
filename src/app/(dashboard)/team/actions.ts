'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireProjectAdminContext } from '@/lib/rbac'
import {
  getSchemaErrorMessage,
  inviteMemberSchema,
  normalizeSchemaInput,
  updateMemberRoleSchema,
} from '@/lib/schemas'
import { z } from 'zod'

type MemberRow = {
  id: string
  user_id: string
  role: 'admin' | 'member'
  projects: { owner_id: string | null } | null
}

const updateMemberRoleActionSchema = updateMemberRoleSchema.extend({
  memberId: z.string().uuid(),
})

const removeMemberActionSchema = z.object({
  projectId: z.string().uuid(),
  memberId: z.string().uuid(),
})

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
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const result = inviteMemberSchema.safeParse(
    normalizeSchemaInput(Object.fromEntries(formData))
  )

  if (!result.success) {
    throw new Error(getSchemaErrorMessage(result.error))
  }

  const projectAccess = await requireProjectAdminContext(result.data.projectId)
  if (!projectAccess.canManageProject) {
    throw new Error('Forbidden')
  }

  const email = result.data.email.trim().toLowerCase()

  const { data: targetProfile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('email', email)
    .single()

  if (profileError || !targetProfile) {
    throw new Error(`No user found with email "${result.data.email}". They must sign up first.`)
  }

  const { data: existing, error: existingError } = await supabase
    .from('project_members')
    .select('id')
    .eq('project_id', result.data.projectId)
    .eq('user_id', targetProfile.id)
    .maybeSingle()

  if (existingError) throw new Error(existingError.message)
  if (existing) throw new Error(`${result.data.email} is already a member of this project.`)

  const { error } = await supabase
    .from('project_members')
    .insert({ project_id: result.data.projectId, user_id: targetProfile.id, role: result.data.role })

  if (error) throw new Error(error.message)

  revalidatePath('/team')
  revalidatePath(`/projects/${result.data.projectId}`)
  return { name: targetProfile.full_name ?? result.data.email }
}

export async function updateMemberRole(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const memberResult = updateMemberRoleActionSchema.safeParse(
    normalizeSchemaInput(Object.fromEntries(formData))
  )

  if (!memberResult.success) {
    throw new Error(getSchemaErrorMessage(memberResult.error))
  }

  const projectAccess = await requireProjectAdminContext(memberResult.data.projectId)
  if (!projectAccess.canManageProject) {
    throw new Error('Forbidden')
  }

  const memberQuery = supabase
    .from('project_members')
    .select('id, user_id, role, projects(owner_id)')
    .eq('project_id', memberResult.data.projectId)
    .eq('user_id', memberResult.data.memberId)

  const { data: member, error: memberError } = await memberQuery.single<MemberRow>()

  if (memberError || !member) {
    throw new Error('Member not found.')
  }

  const project = member.projects
  if (project?.owner_id === memberResult.data.memberId) {
    throw new Error('Project owner role cannot be changed.')
  }

  if (member.role === 'admin' && memberResult.data.role === 'member') {
    await ensureAnotherAdmin(supabase, memberResult.data.projectId, memberResult.data.memberId)
  }

  const { error } = await supabase
    .from('project_members')
    .update({ role: memberResult.data.role })
    .eq('project_id', memberResult.data.projectId)
    .eq('user_id', memberResult.data.memberId)

  if (error) throw new Error(error.message)

  revalidatePath('/team')
  revalidatePath(`/projects/${memberResult.data.projectId}`)
  return { success: true }
}

export async function removeMember(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const result = removeMemberActionSchema.safeParse(
    normalizeSchemaInput(Object.fromEntries(formData))
  )

  if (!result.success) {
    throw new Error(getSchemaErrorMessage(result.error))
  }

  const projectAccess = await requireProjectAdminContext(result.data.projectId)
  if (!projectAccess.canManageProject) {
    throw new Error('Forbidden')
  }

  const memberQuery = supabase
    .from('project_members')
    .select('id, user_id, role, projects(owner_id)')
    .eq('project_id', result.data.projectId)
    .eq('user_id', result.data.memberId)

  const { data: member, error: memberError } = await memberQuery.single<MemberRow>()

  if (memberError || !member) {
    throw new Error('Member not found.')
  }

  const project = member.projects
  if (project?.owner_id === result.data.memberId) {
    throw new Error('Project owner cannot be removed.')
  }

  if (member.role === 'admin') {
    await ensureAnotherAdmin(supabase, result.data.projectId, result.data.memberId)
  }

  const { error } = await supabase
    .from('project_members')
    .delete()
    .eq('project_id', result.data.projectId)
    .eq('user_id', result.data.memberId)

  if (error) throw new Error(error.message)

  revalidatePath('/team')
  revalidatePath(`/projects/${result.data.projectId}`)
  return { success: true }
}
