import 'server-only'

import { requireAdminContext } from '@/lib/rbac'
import type { UserProfile } from '@/types/user.types'

export async function getAdminUsers(): Promise<UserProfile[]> {
  const { supabase } = await requireAdminContext()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as UserProfile[]
}
