import { inviteMemberSchema } from '@/lib/schemas'
import {
  jsonError,
  parseJsonBody,
  validationErrorResponse,
} from '../_utils'
import { z } from 'zod'
import { getProjectMembers, inviteMember } from '@/lib/services/team.service'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')

  if (!projectId) {
    return jsonError('Project is required.', 400)
  }

  const projectIdCheck = z.string().uuid().safeParse(projectId)
  if (!projectIdCheck.success) return validationErrorResponse(projectIdCheck.error)

  try {
    const data = await getProjectMembers(projectId)
    return Response.json({ data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    const status =
      message === 'Unauthorized'
        ? 401
        : message === 'Forbidden'
          ? 403
          : message === 'Project not found.'
            ? 404
            : 500
    return jsonError(message, status)
  }
}

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, inviteMemberSchema)
  if ('error' in parsed) return parsed.error

  try {
    const result = await inviteMember(parsed.data)

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
