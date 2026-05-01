import React from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Navbar } from '@/components/Navbar'
import { getAuthContext } from '@/lib/rbac'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile, isAdmin } = await getAuthContext()
  const fullName = profile?.full_name ?? user.email ?? 'User'
  const email = profile?.email ?? user.email ?? ''

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar isAdmin={isAdmin} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar fullName={fullName} email={email} isAdmin={isAdmin} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
