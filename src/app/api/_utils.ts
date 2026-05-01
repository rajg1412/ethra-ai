import { getSchemaErrorMessage, normalizeSchemaInput } from '@/lib/schemas'
import { createClient } from '@/utils/supabase/server'
import type { z, ZodTypeAny } from 'zod'

export async function requireApiAuth() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      error: Response.json({ error: 'Unauthorized' }, { status: 401 }),
    } as const
  }

  return { supabase, user } as const
}

export function jsonError(error: string, status: number) {
  return Response.json({ error }, { status })
}

export function validationErrorResponse(error: z.ZodError) {
  return Response.json({ error: getSchemaErrorMessage(error) }, { status: 400 })
}

export async function parseJsonBody<T extends ZodTypeAny>(
  request: Request,
  schema: T
) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return { error: jsonError('Invalid JSON body', 400) } as const
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: jsonError('Invalid JSON body', 400) } as const
  }

  const result = schema.safeParse(
    normalizeSchemaInput(body as Record<string, unknown>)
  )

  if (!result.success) {
    return { error: validationErrorResponse(result.error) } as const
  }

  return { data: result.data } as const
}

export function toFormData(values: Record<string, unknown>) {
  const formData = new FormData()

  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === null) continue
    formData.set(key, String(value))
  }

  return formData
}
