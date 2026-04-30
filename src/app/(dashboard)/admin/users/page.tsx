import React from 'react'
import { redirect } from 'next/navigation'
import { Users, ShieldCheck, MoreVertical, Search, UserCog, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table'
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/utils/supabase/server'

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Enforce admin-only access — redirect members away
  if (!user) redirect('/login')
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!currentProfile?.is_admin) redirect('/dashboard')

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('updated_at', { ascending: false })

  const total = users?.length ?? 0
  const globalAdmins = users?.filter((u: any) => u.is_admin).length ?? 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-5 h-5 text-black" />
            <h1 className="text-2xl font-bold text-black tracking-tight">Admin Console</h1>
          </div>
          <p className="text-sm text-slate-500">Manage global user access and permissions.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input
              placeholder="Search users…"
              className="h-8 pl-9 text-sm bg-white border-slate-200 text-black placeholder:text-slate-400 focus-visible:ring-black w-52"
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: total },
          { label: 'Global Admins', value: globalAdmins },
          { label: 'Regular Users', value: total - globalAdmins },
          { label: 'Active Today', value: '—' },
        ].map((s) => (
          <Card key={s.label} className="bg-white border-slate-200 shadow-none">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">{s.label}</p>
              <p className="text-2xl font-bold text-black mt-1">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="bg-white border-slate-200 shadow-none overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
          <CardTitle className="text-base font-bold text-black flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500" />
            All Users
          </CardTitle>
          <Button variant="outline" size="sm" className="border-slate-200 text-slate-600 hover:bg-slate-50 text-xs h-7">
            Export CSV
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-slate-100 hover:bg-slate-50">
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-widest">User</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Role</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Joined</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!users || users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-sm text-slate-400">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : users.map((user: any) => (
                <TableRow key={user.id} className="border-slate-100 hover:bg-slate-50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-slate-200">
                        <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} />
                        <AvatarFallback className="text-xs bg-slate-100 text-slate-600">
                          {user.full_name?.[0]?.toUpperCase() ?? 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-black">{user.full_name ?? '—'}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.is_admin ? (
                      <Badge className="bg-black text-white text-[10px] font-semibold gap-1 shadow-none hover:bg-slate-800">
                        <ShieldCheck className="w-3 h-3" /> Global Admin
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-slate-500 border-slate-200 text-[10px] font-semibold">
                        User
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {user.updated_at
                      ? new Date(user.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <button className="h-8 w-8 flex items-center justify-center rounded-md text-slate-400 hover:text-black hover:bg-slate-100 transition-colors ml-auto">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      } />
                      <DropdownMenuContent align="end" className="w-48 bg-white border-slate-200 shadow-lg">
                        <DropdownMenuItem className="text-sm cursor-pointer focus:bg-slate-50 gap-2">
                          <UserCog className="w-4 h-4 text-slate-500" />
                          {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-sm cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                          Suspend User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
