import 'server-only'

import {
  createTaskSchema,
  getSchemaErrorMessage,
  normalizeSchemaInput,
  updateTaskSchema,
} from '@/lib/schemas'
import {
  normalizeTaskStatus,
  requireAuthContext,
  requireProjectAdminContext,
  requireTaskAdminContext,
  requireTaskEditorContext,
} from '@/lib/rbac'
import type {
  TaskDetail,
  TaskListItem,
  TaskPriority,
  TaskStatus,
} from '@/types/task.types'
import { z } from 'zod'

type SupabaseClient = Awaited<ReturnType<typeof requireAuthContext>>['supabase']

const taskListSelect =
  '*, profiles(full_name, avatar_url), projects(name)'

const taskDetailSelect =
  'id, title, description, project_id, status, priority, assigned_to, due_date'

function assertUuid(value: string, message = 'Invalid task id.') {
  const parsed = z.string().uuid().safeParse(value)
  if (!parsed.success) {
    throw new Error(message)
  }
}

async function assertAssigneeBelongsToProject(
  projectId: string,
  assignedTo: string,
  supabase: SupabaseClient
) {
  const { data: assignee, error: assigneeError } = await supabase
    .from('project_members')
    .select('user_id')
    .eq('project_id', projectId)
    .eq('user_id', assignedTo)
    .maybeSingle()

  if (assigneeError) throw new Error(assigneeError.message)
  if (!assignee) {
    throw new Error('Assigned member must belong to this project.')
  }
}

function buildTaskUpdates(input: Record<string, unknown>) {
  const result = updateTaskSchema.safeParse(normalizeSchemaInput(input))
  if (!result.success) {
    throw new Error(getSchemaErrorMessage(result.error))
  }

  return result.data
}

export async function getTasks(projectId?: string): Promise<TaskListItem[]> {
  const { supabase } = await requireAuthContext()

  let query = supabase
    .from('tasks')
    .select(taskListSelect)
    .order('created_at', { ascending: false })

  if (projectId) {
    const parsed = z.string().uuid().safeParse(projectId)
    if (!parsed.success) {
      throw new Error('Invalid project id.')
    }
    query = query.eq('project_id', projectId)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []) as TaskListItem[]
}

export async function createTask(
  input: z.infer<typeof createTaskSchema>
): Promise<TaskDetail> {
  const projectAccess = await requireProjectAdminContext(input.projectId)
  const { supabase } = projectAccess
  if (!projectAccess.canManageProject) {
    throw new Error('Forbidden')
  }

  if (input.assignedTo) {
    await assertAssigneeBelongsToProject(
      input.projectId,
      input.assignedTo,
      supabase
    )
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: input.title.trim(),
      description: input.description?.trim() || null,
      project_id: input.projectId,
      priority: input.priority,
      assigned_to: input.assignedTo || null,
      due_date: input.dueDate || null,
    })
    .select(taskDetailSelect)
    .single()

  if (error) throw new Error(error.message)
  return data as TaskDetail
}

export async function updateTask(
  taskId: string,
  input: Record<string, unknown>
): Promise<TaskDetail> {
  assertUuid(taskId)
  const parsed = buildTaskUpdates(input)
  const keys = Object.entries(parsed).filter(([, value]) => value !== undefined)

  if (keys.length === 0) {
    throw new Error('At least one field is required.')
  }

  const statusOnly = keys.length === 1 && keys[0][0] === 'status' && parsed.status
  const access = statusOnly
    ? await requireTaskEditorContext(taskId)
    : await requireTaskAdminContext(taskId)
  const supabase = access.supabase

  if (statusOnly) {
    const { error } = await supabase
      .from('tasks')
      .update({ status: normalizeTaskStatus(parsed.status as string) })
      .eq('id', taskId)

    if (error) throw new Error(error.message)
  } else {
    if (parsed.assignedTo) {
      await assertAssigneeBelongsToProject(
        access.projectAccess.project.id,
        parsed.assignedTo,
        supabase
      )
    }

    const updates: Partial<{
      status: TaskStatus
      title: string
      description: string | null
      priority: TaskPriority
      assigned_to: string | null
      due_date: string | null
    }> = {}

    if (parsed.status !== undefined) updates.status = parsed.status
    if (parsed.title !== undefined) updates.title = parsed.title.trim()
    if (parsed.description !== undefined) {
      updates.description = parsed.description?.trim() || null
    }
    if (parsed.priority !== undefined) updates.priority = parsed.priority
    if (parsed.assignedTo !== undefined) {
      updates.assigned_to = parsed.assignedTo
    }
    if (parsed.dueDate !== undefined) updates.due_date = parsed.dueDate

    const { error } = await supabase.from('tasks').update(updates).eq('id', taskId)
    if (error) throw new Error(error.message)
  }

  const { data, error: fetchError } = await supabase
    .from('tasks')
    .select(taskDetailSelect)
    .eq('id', taskId)
    .maybeSingle<TaskDetail>()

  if (fetchError) throw new Error(fetchError.message)
  if (!data) throw new Error('Task not found.')

  return data
}

export async function updateTaskStatus(taskId: string, status: string) {
  return updateTask(taskId, { status })
}

export async function deleteTask(taskId: string) {
  assertUuid(taskId)
  const { supabase, projectAccess } = await requireTaskAdminContext(taskId)

  const { error } = await supabase.from('tasks').delete().eq('id', taskId)
  if (error) throw new Error(error.message)

  return { success: true as const, projectId: projectAccess.project.id }
}
