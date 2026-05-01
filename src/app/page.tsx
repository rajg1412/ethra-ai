import { getAuthContext } from '@/lib/rbac'
import { redirect } from 'next/navigation'

export default async function RootPage() {
  try {
    await getAuthContext()
    redirect('/dashboard')
  } catch {
    redirect('/login')
  }
}
