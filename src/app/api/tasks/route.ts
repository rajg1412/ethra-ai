import { createClient } from '@/utils/supabase/server'
import { requireProjectAdminContext } from '@/lib/rbac'
import { createTaskSchema } from '@/lib/schemas'
import {
  jsonError,
  parseJsonBody,
  requireApiAuth,
  validationErrorResponse,
} from '../_utils'
import { getTasks } from '@/app/(dashboard)/tasks/actions'
import { z } from 'zod'

export async function GET(request: Request) {
  const auth = await requireApiAuth()
  if ('error' in auth) return auth.error

  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId') || undefined
  const projectIdCheck = z.string().uuid().optional().safeParse(projectId)
  if (!projectIdCheck.success) return validationErrorResponse(projectIdCheck.error)

  try {
    const data = await getTasks(projectId)
    return Response.json({ data })
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Server error', 500)
  }
}

export async function POST(request: Request) {
  const auth = await requireApiAuth()
  if ('error' in auth) return auth.error

  const parsed = await parseJsonBody(request, createTaskSchema)
  if ('error' in parsed) return parsed.error

  try {
    await requireProjectAdminContext(parsed.data.projectId)
    const supabase = await createClient()

    if (parsed.data.assignedTo) {
      const { data: assignee, error: assigneeError } = await supabase
        .from('project_members')
        .select('user_id')
        .eq('project_id', parsed.data.projectId)
        .eq('user_id', parsed.data.assignedTo)
        .maybeSingle()

      if (assigneeError) throw assigneeError
      if (!assignee) {
        return jsonError('Assigned member must belong to this project.', 400)
      }
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: parsed.data.title.trim(),
        description: parsed.data.description?.trim() || null,
        project_id: parsed.data.projectId,
        priority: parsed.data.priority,
        assigned_to: parsed.data.assignedTo || null,
        due_date: parsed.data.dueDate || null,
      })
      .select('id, title, description, project_id, status, priority, assigned_to, due_date, profiles(full_name, avatar_url), projects(name)')
      .single()

    if (error) throw error

    return Response.json({ data }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    const status =
      message === 'Forbidden'
        ? 403
        : message === 'Project not found.'
          ? 404
          : message === 'Unauthorized'
            ? 401
            : 500

    return jsonError(message, status)
  }
}
