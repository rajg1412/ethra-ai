import { z } from 'zod'

export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
})

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  projectId: z.string().uuid(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  assignedTo: z.string().uuid().optional(),
  dueDate: z.string().datetime().optional(),
})

export const updateTaskSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'completed']).optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  assignedTo: z.string().uuid().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
})

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  projectId: z.string().uuid(),
  role: z.enum(['admin', 'member']).default('member'),
})

export const updateMemberRoleSchema = z.object({
  projectId: z.string().uuid(),
  role: z.enum(['admin', 'member']),
})

export function normalizeSchemaInput(input: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => {
      if (value === '') {
        return [key, undefined]
      }

      if (
        key === 'dueDate' &&
        typeof value === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(value)
      ) {
        return [key, `${value}T00:00:00.000Z`]
      }

      return [key, value]
    })
  )
}

export function getSchemaErrorMessage(error: z.ZodError) {
  return error.issues.map((issue) => issue.message).join(', ')
}
