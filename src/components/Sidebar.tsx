'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Users, 
  Settings, 
  LogOut,
  Plus,
  ShieldAlert
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/app/(auth)/actions'
import { NewProjectModal } from '@/components/NewProjectModal'

export const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: FolderKanban,    label: 'Projects',  href: '/projects'  },
  { icon: CheckSquare,     label: 'Tasks',     href: '/tasks'     },
  { icon: Users,           label: 'Team',      href: '/team'      },
]

export function SidebarLink({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string
  icon: React.ElementType
  label: string
  active: boolean
}) {
  return (
    <Link href={href}>
      <div
        className={cn(
          'relative flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
          active
            ? 'bg-black text-white font-semibold'
            : 'text-slate-500 hover:bg-slate-100 hover:text-black'
        )}
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span>{label}</span>
      </div>
    </Link>
  )
}

export function Sidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-52 bg-white border-r border-slate-200 flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-6">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-black rounded flex items-center justify-center shrink-0">
            <CheckSquare className="text-white w-4 h-4" />
          </div>
          <span className="text-base font-bold text-black tracking-tight">Ethra</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-3">Menu</p>

        {navItems.map((item) => {
          const isActive = pathname === item.href
          return <SidebarLink key={item.href} href={item.href} icon={item.icon} label={item.label} active={isActive} />
        })}

        {isAdmin && (
          <>
            <div className="pt-4 pb-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3">Admin</p>
            </div>
            <SidebarLink
              href="/admin/users"
              icon={ShieldAlert}
              label="Users"
              active={pathname.startsWith('/admin')}
            />
          </>
        )}

        {/* New Project — uses div, not button, to avoid nested-button hydration error */}
        <div className="pt-4 pb-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3">Actions</p>
        </div>
        <NewProjectModal>
          <button className="flex items-center w-full gap-2.5 px-3 py-2 rounded-md text-sm text-slate-500 hover:bg-slate-100 hover:text-black transition-colors cursor-pointer text-left">
            <Plus className="w-4 h-4 shrink-0" />
            <span>New Project</span>
          </button>
        </NewProjectModal>
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-slate-100 space-y-0.5">
        <Link href="/settings">
          <div className={cn(
            'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
            pathname === '/settings'
              ? 'bg-black text-white font-semibold'
              : 'text-slate-500 hover:bg-slate-100 hover:text-black'
          )}>
            <Settings className="w-4 h-4 shrink-0" />
            <span>Settings</span>
          </div>
        </Link>
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-slate-500 hover:bg-slate-100 hover:text-black transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
