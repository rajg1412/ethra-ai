import { getProjectAccess } from '@/lib/rbac'
import { jsonError, requireApiAuth } from '../../_utils'
import { z } from 'zod'
import { validationErrorResponse } from '../../_utils'

type Params = {
  params: Promise<{ id: string }>
}

type ProjectRow = {
  id: string
  name: string
  description: string | null
  created_at: string
  owner_id: string | null
  project_members: { count: number }[]
}

export async function GET(
  _request: Request,
  context: Params
) {
  const auth = await requireApiAuth()
  if ('error' in auth) return auth.error

  const { id } = await context.params
  const idCheck = z.string().uuid().safeParse(id)
  if (!idCheck.success) return validationErrorResponse(idCheck.error)

  try {
    const access = await getProjectAccess(id)
    if (!access.canViewProject) {
      return jsonError('Forbidden', 403)
    }

    const { supabase } = auth
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, description, created_at, owner_id, project_members(count)')
      .eq('id', id)
      .maybeSingle<ProjectRow>()

    if (error) throw error
    if (!data) return jsonError('Project not found.', 404)

    return Response.json({ data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    const status = message === 'Project not found.' ? 404 : 500
    return jsonError(message, status)
  }
}

export async function DELETE(
  _request: Request,
  context: Params
) {
  const auth = await requireApiAuth()
  if ('error' in auth) return auth.error

  const { id } = await context.params
  const idCheck = z.string().uuid().safeParse(id)
  if (!idCheck.success) return validationErrorResponse(idCheck.error)

  try {
    const access = await getProjectAccess(id)
    if (!access.canManageProject) {
      return jsonError('Forbidden', 403)
    }

    const { supabase } = auth
    const { error } = await supabase.from('projects').delete().eq('id', id)

    if (error) throw error

    return Response.json({ data: { success: true } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    const status = message === 'Project not found.' ? 404 : 500
    return jsonError(message, status)
  }
}
