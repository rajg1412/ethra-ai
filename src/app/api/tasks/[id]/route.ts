import { jsonError, parseJsonBody, validationErrorResponse } from '../../_utils'
import { z } from 'zod'
import { deleteTask, updateTask } from '@/lib/services/task.service'
import { updateTaskSchema } from '@/lib/schemas'

type Params = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, context: Params) {
  const { id } = await context.params
  const idCheck = z.string().uuid().safeParse(id)
  if (!idCheck.success) return validationErrorResponse(idCheck.error)
  const parsed = await parseJsonBody(request, updateTaskSchema)
  if ('error' in parsed) return parsed.error

  if (Object.keys(parsed.data).length === 0) {
    return jsonError('At least one field is required.', 400)
  }

  try {
    const data = await updateTask(id, parsed.data)
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

export async function DELETE(_request: Request, context: Params) {
  const { id } = await context.params
  const idCheck = z.string().uuid().safeParse(id)
  if (!idCheck.success) return validationErrorResponse(idCheck.error)

  try {
    const result = await deleteTask(id)
    return Response.json({ data: result })
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
