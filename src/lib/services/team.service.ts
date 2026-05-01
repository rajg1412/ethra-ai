import 'server-only'

import {
  getSchemaErrorMessage,
  inviteMemberSchema,
  normalizeSchemaInput,
  updateMemberRoleSchema,
} from '@/lib/schemas'
import {
  requireAuthContext,
  getProjectAccess,
  requireProjectAdminContext,
} from '@/lib/rbac'
import type { TeamMemberRow } from '@/types/team.types'
import type { ProjectRole } from '@/types/project.types'
import { z } from 'zod'

type SupabaseClient = Awaited<ReturnType<typeof requireAuthContext>>['supabase']

const memberDetailSelect =
  'id, user_id, role, project_id, profiles(full_name, email), projects(name, owner_id)'

const memberRoleActionSchema = updateMemberRoleSchema.extend({
  memberId: z.string().uuid(),
})

const removeMemberActionSchema = z.object({
  projectId: z.string().uuid(),
  memberId: z.string().uuid(),
})

async function ensureAnotherAdmin(
  supabase: SupabaseClient,
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

export async function getTeamMembers(): Promise<TeamMemberRow[]> {
  const { supabase } = await requireAuthContext()

  const { data, error } = await supabase
    .from('project_members')
    .select(memberDetailSelect)

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as TeamMemberRow[]
}

export async function getProjectMembers(projectId: string): Promise<TeamMemberRow[]> {
  const access = await getProjectAccess(projectId)
  if (!access.canViewProject) {
    throw new Error('Forbidden')
  }

  const { supabase } = await requireAuthContext()
  const { data, error } = await supabase
    .from('project_members')
    .select(memberDetailSelect)
    .eq('project_id', projectId)

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as TeamMemberRow[]
}

export async function inviteMember(input: Record<string, unknown>) {
  const result = inviteMemberSchema.safeParse(normalizeSchemaInput(input))

  if (!result.success) {
    throw new Error(getSchemaErrorMessage(result.error))
  }

  const projectAccess = await requireProjectAdminContext(result.data.projectId)
  const { supabase } = projectAccess
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
  if (existing) {
    throw new Error(`${result.data.email} is already a member of this project.`)
  }

  const { error } = await supabase
    .from('project_members')
    .insert({
      project_id: result.data.projectId,
      user_id: targetProfile.id,
      role: result.data.role,
    })

  if (error) throw new Error(error.message)

  return { name: targetProfile.full_name ?? result.data.email, projectId: result.data.projectId }
}

export async function updateMemberRole(input: Record<string, unknown>) {
  const result = memberRoleActionSchema.safeParse(
    normalizeSchemaInput(input)
  )

  if (!result.success) {
    throw new Error(getSchemaErrorMessage(result.error))
  }

  const projectAccess = await requireProjectAdminContext(result.data.projectId)
  const { supabase } = projectAccess
  if (!projectAccess.canManageProject) {
    throw new Error('Forbidden')
  }

  const { data: member, error: memberError } = await supabase
    .from('project_members')
    .select('id, user_id, role, projects(owner_id)')
    .eq('project_id', result.data.projectId)
    .eq('user_id', result.data.memberId)
    .single<{
      id: string
      user_id: string
      role: ProjectRole
      projects: { owner_id: string | null } | null
    }>()

  if (memberError || !member) {
    throw new Error('Member not found.')
  }

  if (member.projects?.owner_id === result.data.memberId) {
    throw new Error('Project owner role cannot be changed.')
  }

  if (member.role === 'admin' && result.data.role === 'member') {
    await ensureAnotherAdmin(supabase, result.data.projectId, result.data.memberId)
  }

  const { error } = await supabase
    .from('project_members')
    .update({ role: result.data.role })
    .eq('project_id', result.data.projectId)
    .eq('user_id', result.data.memberId)

  if (error) throw new Error(error.message)

  return { success: true as const, projectId: result.data.projectId }
}

export async function removeMember(input: Record<string, unknown>) {
  const result = removeMemberActionSchema.safeParse(
    normalizeSchemaInput(input)
  )

  if (!result.success) {
    throw new Error(getSchemaErrorMessage(result.error))
  }

  const projectAccess = await requireProjectAdminContext(result.data.projectId)
  const { supabase } = projectAccess
  if (!projectAccess.canManageProject) {
    throw new Error('Forbidden')
  }

  const { data: member, error: memberError } = await supabase
    .from('project_members')
    .select('id, user_id, role, projects(owner_id)')
    .eq('project_id', result.data.projectId)
    .eq('user_id', result.data.memberId)
    .single<{
      id: string
      user_id: string
      role: ProjectRole
      projects: { owner_id: string | null } | null
    }>()

  if (memberError || !member) {
    throw new Error('Member not found.')
  }

  if (member.projects?.owner_id === result.data.memberId) {
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

  return { success: true as const, projectId: result.data.projectId }
}
