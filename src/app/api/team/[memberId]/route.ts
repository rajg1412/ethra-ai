import { removeMember, updateMemberRole } from '@/app/(dashboard)/team/actions'
import { updateMemberRoleSchema } from '@/lib/schemas'
import { jsonError, parseJsonBody, requireApiAuth, toFormData, validationErrorResponse } from '../../_utils'
import { z } from 'zod'

type Params = {
  params: Promise<{ memberId: string }>
}

export async function PATCH(
  request: Request,
  context: Params
) {
  const auth = await requireApiAuth()
  if ('error' in auth) return auth.error

  const { memberId } = await context.params
  const memberIdCheck = z.string().uuid().safeParse(memberId)
  if (!memberIdCheck.success) return validationErrorResponse(memberIdCheck.error)
  const parsed = await parseJsonBody(request, updateMemberRoleSchema)
  if ('error' in parsed) return parsed.error

  try {
    const result = await updateMemberRole(
      toFormData({
        memberId,
        projectId: parsed.data.projectId,
        role: parsed.data.role,
      })
    )

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
  const auth = await requireApiAuth()
  if ('error' in auth) return auth.error

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
    const result = await removeMember(
      toFormData({
        memberId,
        projectId,
      })
    )

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
