import { updateMemberRoleSchema } from '@/lib/schemas'
import { jsonError, parseJsonBody, validationErrorResponse } from '../../_utils'
import { z } from 'zod'
import { removeMember, updateMemberRole } from '@/lib/services/team.service'

type Params = {
  params: Promise<{ memberId: string }>
}

export async function PATCH(
  request: Request,
  context: Params
) {
  const { memberId } = await context.params
  const memberIdCheck = z.string().uuid().safeParse(memberId)
  if (!memberIdCheck.success) return validationErrorResponse(memberIdCheck.error)
  const parsed = await parseJsonBody(request, updateMemberRoleSchema)
  if ('error' in parsed) return parsed.error

  try {
    const result = await updateMemberRole({
      memberId,
      projectId: parsed.data.projectId,
      role: parsed.data.role,
    })

    return Response.json({ data: result })
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

export async function DELETE(
  request: Request,
  context: Params
) {
  const { memberId } = await context.params
  const memberIdCheck = z.string().uuid().safeParse(memberId)
  if (!memberIdCheck.success) return validationErrorResponse(memberIdCheck.error)
  const projectId = new URL(request.url).searchParams.get('projectId')

  if (!projectId) {
    return jsonError('Project is required.', 400)
  }

  const projectIdCheck = z.string().uuid().safeParse(projectId)
  if (!projectIdCheck.success) return validationErrorResponse(projectIdCheck.error)

  try {
    const result = await removeMember({
      memberId,
      projectId,
    })

    return Response.json({ data: result })
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
