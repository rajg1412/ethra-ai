import { redirect } from 'next/navigation'
import { getAdminUsers } from '@/lib/services/user.service'
import { requireAdminContext } from '@/lib/rbac'
import AdminUsersContent from './AdminUsersContent'

export default async function AdminUsersPage() {
  try {
    await requireAdminContext()
  } catch {
    redirect('/dashboard')
  }

  const users = await getAdminUsers()

  return <AdminUsersContent users={users} />
}
