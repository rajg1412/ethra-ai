import { createClient } from '@/utils/supabase/server'
import { requireTaskAdminContext, requireTaskEditorContext } from '@/lib/rbac'
import { updateTaskSchema } from '@/lib/schemas'
import { jsonError, parseJsonBody, requireApiAuth, validationErrorResponse } from '../../_utils'
import { z } from 'zod'

type Params = {
  params: Promise<{ id: string }>
}

type TaskRow = {
  id: string
  title: string
  description: string | null
  project_id: string
  status: 'todo' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  assigned_to: string | null
  due_date: string | null
}

export async function PATCH(
  request: Request,
  context: Params
) {
  const auth = await requireApiAuth()
  if ('error' in auth) return auth.error

  const { id } = await context.params
  const idCheck = z.string().uuid().safeParse(id)
  if (!idCheck.success) return validationErrorResponse(idCheck.error)
  const parsed = await parseJsonBody(request, updateTaskSchema)
  if ('error' in parsed) return parsed.error

  if (Object.keys(parsed.data).length === 0) {
    return jsonError('At least one field is required.', 400)
  }

  const statusOnly =
    Object.keys(parsed.data).every((key) => key === 'status') &&
    parsed.data.status

  try {
    const supabase = await createClient()

    if (statusOnly) {
      await requireTaskEditorContext(id)

      const { error } = await supabase
        .from('tasks')
        .update({ status: parsed.data.status })
        .eq('id', id)

      if (error) throw error

      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('id, title, description, project_id, status, priority, assigned_to, due_date')
        .eq('id', id)
        .maybeSingle<TaskRow>()

      if (fetchError) throw fetchError
      if (!data) return jsonError('Task not found.', 404)

      return Response.json({ data })
    }

    const access = await requireTaskAdminContext(id)

    if (parsed.data.assignedTo) {
      const { data: member, error: memberError } = await supabase
        .from('project_members')
        .select('user_id')
        .eq('project_id', access.projectAccess.project.id)
        .eq('user_id', parsed.data.assignedTo)
        .maybeSingle()

      if (memberError) throw memberError
      if (!member) {
        return jsonError('Assigned member must belong to this project.', 400)
      }
    }

    const updates: Partial<TaskRow> = {}

    if (parsed.data.status) updates.status = parsed.data.status
    if (parsed.data.title !== undefined) updates.title = parsed.data.title.trim()
    if (parsed.data.description !== undefined) {
      updates.description = parsed.data.description?.trim() || null
    }
    if (parsed.data.priority !== undefined) updates.priority = parsed.data.priority
    if (parsed.data.assignedTo !== undefined) updates.assigned_to = parsed.data.assignedTo
    if (parsed.data.dueDate !== undefined) updates.due_date = parsed.data.dueDate

    const { error } = await supabase.from('tasks').update(updates).eq('id', id)
    if (error) throw error

    const { data, error: fetchError } = await supabase
      .from('tasks')
      .select('id, title, description, project_id, status, priority, assigned_to, due_date')
      .eq('id', id)
      .maybeSingle<TaskRow>()

    if (fetchError) throw fetchError
    if (!data) return jsonError('Task not found.', 404)

    return Response.json({ data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    const status =
      message === 'Forbidden'
        ? 403
        : message === 'Task not found.'
          ? 404
          : message === 'Unauthorized'
            ? 401
            : 500

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
    await requireTaskAdminContext(id)
    const { supabase } = auth
    const { error } = await supabase.from('tasks').delete().eq('id', id)

    if (error) throw error

    return Response.json({ data: { success: true } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    const status =
      message === 'Forbidden'
        ? 403
        : message === 'Task not found.'
          ? 404
          : message === 'Unauthorized'
            ? 401
            : 500

    return jsonError(message, status)
  }
}
