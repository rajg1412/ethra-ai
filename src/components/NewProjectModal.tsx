'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createProject } from '@/app/(dashboard)/projects/actions'
import { toast } from 'sonner'

export function NewProjectModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    const formData = new FormData(event.currentTarget)
    try {
      await createProject(formData)
      toast.success('Project created!')
      setOpen(false)
      router.refresh()
    } catch {
      toast.error('Failed to create project.')
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
            <DialogTitle className="text-lg font-bold text-black">New Project</DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Create a workspace for your team.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium text-slate-700">Project Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. Website Redesign"
                required
                className="bg-white border-slate-200 text-black placeholder:text-slate-400 focus-visible:ring-black"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-sm font-medium text-slate-700">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="What is this project about?"
                rows={3}
                className="bg-white border-slate-200 text-black placeholder:text-slate-400 focus-visible:ring-black resize-none"
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
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
              disabled={isLoading}
              className="bg-black hover:bg-slate-800 text-white"
            >
              {isLoading ? 'Creating…' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
