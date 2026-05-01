import { inviteMember } from '@/app/(dashboard)/team/actions'
import { getProjectAccess } from '@/lib/rbac'
import { inviteMemberSchema } from '@/lib/schemas'
import {
  jsonError,
  parseJsonBody,
  requireApiAuth,
  toFormData,
  validationErrorResponse,
} from '../_utils'
import { z } from 'zod'

type MemberRow = {
  id: string
  user_id: string
  role: 'admin' | 'member'
  project_id: string
  profiles: { full_name: string | null; email: string | null } | null
  projects: { name: string | null; owner_id: string | null } | null
}

export async function GET(request: Request) {
  const auth = await requireApiAuth()
  if ('error' in auth) return auth.error

  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')

  if (!projectId) {
    return jsonError('Project is required.', 400)
  }

  const projectIdCheck = z.string().uuid().safeParse(projectId)
  if (!projectIdCheck.success) return validationErrorResponse(projectIdCheck.error)

  try {
    const access = await getProjectAccess(projectId)
    if (!access.canViewProject) {
      return jsonError('Forbidden', 403)
    }

    const { supabase } = auth
    const { data, error } = await supabase
      .from('project_members')
      .select('id, user_id, role, project_id, profiles(full_name, email), projects(name, owner_id)')
      .eq('project_id', projectId)

    if (error) throw error

    const rows = (data ?? []).map((row) => ({
      ...row,
      profiles: row.profiles as unknown as { full_name: string | null; email: string | null } | null,
      projects: row.projects as unknown as { name: string | null; owner_id: string | null } | null,
    }))

    return Response.json({ data: rows as MemberRow[] })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    const status = message === 'Project not found.' ? 404 : 500
    return jsonError(message, status)
  }
}

export async function POST(request: Request) {
  const auth = await requireApiAuth()
  if ('error' in auth) return auth.error

  const parsed = await parseJsonBody(request, inviteMemberSchema)
  if ('error' in parsed) return parsed.error

  try {
    const result = await inviteMember(
      toFormData({
        email: parsed.data.email,
        projectId: parsed.data.projectId,
        role: parsed.data.role,
      })
    )

    return Response.json({ data: result }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    const status =
      message === 'Unauthorized'
        ? 401
        : message === 'Forbidden'
          ? 403
          : message.includes('not found')
            ? 404
            : 500

    return jsonError(message, status)
  }
}
