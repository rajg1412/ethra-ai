'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  MoreVertical, 
  Search,
  UserCog
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'

const allUsers = [
  { id: '1', name: 'Raj G', email: 'rajg50103@gmail.com', isAdmin: true, status: 'Active', joinedAt: 'Apr 01, 2026' },
  { id: '2', name: 'John Doe', email: 'john@example.com', isAdmin: false, status: 'Active', joinedAt: 'Apr 10, 2026' },
  { id: '3', name: 'Sarah Wilson', email: 'sarah@example.com', isAdmin: false, status: 'Active', joinedAt: 'Apr 12, 2026' },
  { id: '4', name: 'Alex Rivera', email: 'alex@example.com', isAdmin: false, status: 'Active', joinedAt: 'Apr 15, 2026' },
]

export default function AdminUsersPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <h1 className="text-3xl font-bold text-white tracking-tight">Admin Console</h1>
          </div>
          <p className="text-slate-400">Global user management and system settings.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input 
              placeholder="Search all users..." 
              className="pl-10 bg-slate-900/50 border-slate-800 text-white"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">482</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">System Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-500">3</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">New Signups (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">12</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm overflow-hidden">
        <CardHeader className="border-b border-slate-800/50 flex flex-row items-center justify-between">
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            User Directory
          </CardTitle>
          <Button variant="outline" className="border-slate-800 text-slate-400 text-xs">Export CSV</Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-950/50">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400">User</TableHead>
                <TableHead className="text-slate-400">System Role</TableHead>
                <TableHead className="text-slate-400">Joined Date</TableHead>
                <TableHead className="text-slate-400 text-right">Access</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allUsers.map((user) => (
                <TableRow key={user.id} className="border-slate-800 hover:bg-slate-800/20 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-slate-800">
                        <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-slate-200">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.isAdmin ? (
                        <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Global Admin
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-slate-500 border-slate-800">
                          Regular User
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">{user.joinedAt}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200">
                        <DropdownMenuItem className="hover:bg-slate-800 focus:bg-slate-800 gap-2">
                          <UserCog className="w-4 h-4" />
                          {user.isAdmin ? 'Demote to User' : 'Promote to Admin'}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-slate-800 focus:bg-slate-800 text-rose-400 focus:text-rose-400">
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
