'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Users, 
  Settings, 
  LogOut,
  Plus,
  ChevronRight,
  ShieldAlert
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { logout } from '@/app/(auth)/actions'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: FolderKanban, label: 'Projects', href: '/projects' },
  { icon: CheckSquare, label: 'Tasks', href: '/tasks' },
  { icon: Users, label: 'Team', href: '/team' },
]

export function Sidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-screen sticky top-0 overflow-hidden">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <CheckSquare className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight group-hover:text-indigo-400 transition-colors">Ethra</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-4">Main Menu</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative",
                isActive ? "text-white" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              )}>
                {isActive && (
                  <motion.div 
                    layoutId="active-nav"
                    className="absolute inset-0 bg-indigo-500/10 rounded-lg border border-indigo-500/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-indigo-400" : "group-hover:text-slate-200")} />
                <span className="font-medium z-10">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto text-indigo-400 z-10" />}
              </div>
            </Link>
          )
        })}

        {isAdmin && (
          <Link href="/admin/users">
            <div className={cn(
              "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative",
              pathname.startsWith('/admin') ? "text-white" : "text-slate-400 hover:text-rose-400 hover:bg-rose-500/5"
            )}>
              <ShieldAlert className={cn("w-5 h-5 transition-colors", pathname.startsWith('/admin') ? "text-rose-500" : "group-hover:text-rose-400")} />
              <span className="font-medium z-10">Admin Access</span>
            </div>
          </Link>
        )}

        <div className="pt-8">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-4">Quick Actions</p>
          <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-900 gap-3 px-3">
            <Plus className="w-5 h-5 text-indigo-400" />
            <span>New Project</span>
          </Button>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-4">
        <Link href="/settings">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </div>
        </Link>
        <button 
          onClick={() => logout()}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors w-full text-left"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}
