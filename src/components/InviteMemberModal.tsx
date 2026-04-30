'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { inviteMember } from '@/app/(dashboard)/team/actions'
import { toast } from 'sonner'

interface Project { id: string; name: string }

export function InviteMemberModal({
  children,
  projects,
}: {
  children: React.ReactNode
  projects: Project[]
}) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [projectId, setProjectId] = useState(projects[0]?.id ?? '')
  const [role, setRole] = useState('member')
  const router = useRouter()

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.set('projectId', projectId)
    formData.set('role', role)
    try {
      const result = await inviteMember(formData)
      toast.success(`${result.name} has been added to the project!`)
      setOpen(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to invite member.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children} />
      <DialogContent className="sm:max-w-md bg-white border border-slate-200 text-black shadow-xl">
        <form onSubmit={onSubmit}>
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg font-bold text-black">Invite Member</DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Add a team member to one of your projects by their email address.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="invite-email" className="text-sm font-medium text-slate-700">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="invite-email"
                name="email"
                type="email"
                placeholder="colleague@example.com"
                required
                className="bg-white border-slate-200 text-black placeholder:text-slate-400 focus-visible:ring-black"
              />
              <p className="text-xs text-slate-400">They must already have an account in Ethra.</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Project <span className="text-red-500">*</span></Label>
              {projects.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No projects yet. Create one first.</p>
              ) : (
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger className="bg-white border-slate-200 text-black focus:ring-black h-9">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-black">
                    {projects.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="bg-white border-slate-200 text-black focus:ring-black h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 text-black">
                  <SelectItem value="member">Member — can view and manage tasks</SelectItem>
                  <SelectItem value="admin">Admin — can manage team & project</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || projects.length === 0}
              className="bg-black hover:bg-slate-800 text-white"
            >
              {isLoading ? 'Inviting…' : 'Send Invite'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
