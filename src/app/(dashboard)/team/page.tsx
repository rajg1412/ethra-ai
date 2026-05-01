import React from 'react'
import { UserPlus, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { createClient } from '@/utils/supabase/server'
import { InviteMemberModal } from '@/components/InviteMemberModal'
import { getManageableProjects } from '@/app/(dashboard)/projects/actions'
import { getAuthContext } from '@/lib/rbac'
import { TeamMemberActions } from '@/components/TeamMemberActions'

type TeamMemberRow = {
  id: string
  user_id: string
  role: 'admin' | 'member'
  project_id: string
  profiles?: { full_name?: string | null; email?: string | null } | null
  projects?: { name?: string | null; owner_id?: string | null } | null
}

type ManageableProject = {
  id: string
  name: string
}

export default async function TeamPage() {
  const supabase = await createClient()
  const { user } = await getAuthContext()

  const { data: members } = await supabase
    .from('project_members')
    .select('*, profiles(full_name, email), projects(name, owner_id)')

  const projects = await getManageableProjects()
  const manageableProjectIds = new Set(projects.map((project: ManageableProject) => project.id))

  const typedMembers = (members ?? []) as TeamMemberRow[]
  const total = typedMembers.length
  const admins = typedMembers.filter((member) => member.role === 'admin').length

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black tracking-tight">Team</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage members and their project roles.
          </p>
        </div>
        {projects.length > 0 && (
          <InviteMemberModal projects={projects.map((project: ManageableProject) => ({ id: project.id, name: project.name }))}>
            <button className="inline-flex items-center justify-center bg-black hover:bg-slate-800 text-white text-sm font-medium h-9 px-4 rounded-md gap-2 cursor-pointer transition-colors">
              <UserPlus className="w-4 h-4" />
              Invite Member
            </button>
          </InviteMemberModal>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-white border-slate-200 shadow-none overflow-hidden">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold text-black">Members ({total})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 border-slate-100 hover:bg-slate-50">
                    <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Member</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Role</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Project</TableHead>
                    <TableHead className="text-right" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!members || members.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-sm text-slate-400">
                        No team members yet. {projects.length > 0 && 'Use "Invite Member" to add people.'}
                      </TableCell>
                    </TableRow>
                  ) : typedMembers.map((member) => {
                    const canManage = manageableProjectIds.has(member.project_id)
                    const isOwner = member.projects?.owner_id === member.user_id

                    return (
                      <TableRow key={member.id} className="border-slate-100 hover:bg-slate-50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border border-slate-200">
                              <AvatarImage src={`https://avatar.vercel.sh/${member.profiles?.email}`} />
                              <AvatarFallback className="text-xs bg-slate-100 text-slate-600">
                                {member.profiles?.full_name?.[0]?.toUpperCase() ?? 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-black">{member.profiles?.full_name ?? '—'}</p>
                              <p className="text-xs text-slate-400">{member.profiles?.email ?? ''}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {member.role === 'admin' ? (
                            <Badge className="bg-black text-white text-[10px] font-semibold gap-1 shadow-none hover:bg-slate-800">
                              <Shield className="w-3 h-3" /> Admin
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-slate-500 border-slate-200 text-[10px] font-semibold">
                              Member
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">{member.projects?.name ?? '—'}</TableCell>
                        <TableCell className="text-right">
                          {canManage && member.user_id !== user.id ? (
                            <TeamMemberActions
                              projectId={member.project_id}
                              memberId={member.user_id}
                              currentRole={member.role}
                              canManage={canManage}
                              isOwner={isOwner}
                            />
                          ) : null}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="bg-white border-slate-200 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-black">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Total Members</span>
                <span className="text-xl font-bold text-black">{total}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-500">Admins</span>
                <span className="text-xl font-bold text-black">{admins}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-black shadow-none">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-white" />
                <h3 className="text-sm font-semibold text-white">Access Control</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Only project admins and the project owner can invite members, change roles, and remove people from a project.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
