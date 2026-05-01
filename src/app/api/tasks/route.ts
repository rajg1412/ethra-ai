import { createTaskSchema } from '@/lib/schemas'
import {
  jsonError,
  parseJsonBody,
  validationErrorResponse,
} from '../_utils'
import { z } from 'zod'
import { createTask, getTasks } from '@/lib/services/task.service'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId') || undefined
  const projectIdCheck = z.string().uuid().optional().safeParse(projectId)
  if (!projectIdCheck.success) return validationErrorResponse(projectIdCheck.error)

  try {
    const data = await getTasks(projectId)
    return Response.json({ data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    const status =
      message === 'Unauthorized'
        ? 401
        : message === 'Forbidden'
          ? 403
          : message === 'Invalid project id.'
            ? 400
            : 500

    return jsonError(message, status)
  }
}

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, createTaskSchema)
  if ('error' in parsed) return parsed.error

  try {
    const data = await createTask(parsed.data)

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
