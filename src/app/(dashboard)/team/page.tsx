'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  MoreVertical, 
  Trash2,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
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

const teamMembers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', projects: 5 },
  { id: '2', name: 'Sarah Wilson', email: 'sarah@example.com', role: 'Member', status: 'Active', projects: 3 },
  { id: '3', name: 'Alex Rivera', email: 'alex@example.com', role: 'Member', status: 'Pending', projects: 2 },
  { id: '4', name: 'Emily Chen', email: 'emily@example.com', role: 'Admin', status: 'Active', projects: 4 },
]

export default function TeamPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Team Management</h1>
          <p className="text-slate-400 mt-1">Manage your team members and their access levels.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 px-6">
          <UserPlus className="w-4 h-4" />
          <span>Invite Member</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm overflow-hidden">
            <CardHeader className="border-b border-slate-800/50">
              <CardTitle className="text-xl text-white">Active Members</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-950/50">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">Member</TableHead>
                    <TableHead className="text-slate-400">Role</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member, i) => (
                    <TableRow key={member.id} className="border-slate-800 hover:bg-slate-800/20 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-slate-800">
                            <AvatarImage src={`https://avatar.vercel.sh/${member.email}`} />
                            <AvatarFallback>{member.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-slate-200">{member.name}</p>
                            <p className="text-xs text-slate-500">{member.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {member.role === 'Admin' ? (
                            <Shield className="w-3 h-3 text-indigo-400" />
                          ) : (
                            <Users className="w-3 h-3 text-slate-500" />
                          )}
                          <span className={member.role === 'Admin' ? 'text-indigo-400 text-sm' : 'text-slate-400 text-sm'}>
                            {member.role}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={member.status === 'Active' ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/5' : 'border-amber-500/50 text-amber-400 bg-amber-500/5'}
                        >
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200">
                            <DropdownMenuItem className="hover:bg-slate-800 focus:bg-slate-800">View Profile</DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-slate-800 focus:bg-slate-800">Change Role</DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-slate-800 focus:bg-slate-800 text-rose-400 focus:text-rose-400">Remove</DropdownMenuItem>
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

        <div className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-white">Team Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                <span className="text-sm text-slate-400">Total Members</span>
                <span className="text-xl font-bold text-white">12</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                <span className="text-sm text-slate-400">Project Admins</span>
                <span className="text-xl font-bold text-indigo-400">4</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                <span className="text-sm text-slate-400">Pending Invites</span>
                <span className="text-xl font-bold text-amber-400">2</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border-indigo-500/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-400" />
                Security Notice
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Only Project Admins can invite new members or change role assignments. 
                System-wide roles are managed by the Global Admin.
              </p>
              <Button variant="link" className="text-indigo-400 text-xs p-0 h-auto mt-4">
                Learn more about RBAC <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
