'use client'

import React from 'react'
import { Search, Bell, LogOut, User, Shield } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { logout } from '@/app/(auth)/actions'

interface NavbarProps {
  fullName?: string
  email?: string
  isAdmin?: boolean
}

export function Navbar({ fullName = 'User', email = '', isAdmin = false }: NavbarProps) {
  const initials = fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="h-14 border-b border-slate-200 bg-white sticky top-0 z-30 px-6 flex items-center justify-between gap-4">
      {/* Search */}
      <div className="flex-1 max-w-xs hidden md:block">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-black transition-colors" />
          <Input
            placeholder="Search…"
            className="h-8 pl-9 text-sm bg-slate-50 border-slate-200 text-black placeholder:text-slate-400 focus-visible:ring-black rounded-md"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Admin badge — only visible to admins */}
        {isAdmin && (
          <Badge className="bg-black text-white text-[10px] font-bold gap-1 hidden sm:flex h-6 shadow-none">
            <Shield className="w-3 h-3" />
            Admin
          </Badge>
        )}

        {/* Bell */}
        <button className="h-8 w-8 flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-black transition-colors">
          <Bell className="w-4 h-4" />
        </button>

        {/* Avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <div
              role="button"
              tabIndex={0}
              className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-black"
            >
              <Avatar className="h-7 w-7 border border-slate-200">
                <AvatarFallback className="text-[11px] bg-slate-900 text-white font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-black leading-tight">{fullName}</p>
                <p className="text-[10px] text-slate-400 leading-tight">{isAdmin ? 'Global Admin' : 'Member'}</p>
              </div>
            </div>
          } />
          <DropdownMenuContent align="end" className="w-52 bg-white border-slate-200 shadow-lg text-black">
            <DropdownMenuLabel className="pb-2">
              <p className="text-sm font-bold text-black">{fullName}</p>
              <p className="text-xs text-slate-400 font-normal mt-0.5">{email}</p>
              {isAdmin && (
                <Badge className="bg-black text-white text-[9px] gap-1 mt-1.5 h-5 shadow-none">
                  <Shield className="w-2.5 h-2.5" />
                  Global Admin
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem className="text-sm cursor-pointer focus:bg-slate-50 gap-2">
              <User className="w-4 h-4 text-slate-400" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem
              className="text-sm cursor-pointer focus:bg-red-50 focus:text-red-600 text-red-500 gap-2"
              onClick={() => logout()}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
