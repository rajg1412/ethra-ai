'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createTask } from '@/app/(dashboard)/tasks/actions'
import { toast } from 'sonner'

interface Project { id: string; name: string }

export function NewTaskModal({
  children,
  projects,
  defaultProjectId,
}: {
  children: React.ReactNode
  projects?: Project[]
  defaultProjectId?: string
}) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [priority, setPriority] = useState('medium')
  const [projectId, setProjectId] = useState(defaultProjectId ?? '')
  const router = useRouter()

  // Reset on open
  useEffect(() => {
    if (open) {
      setPriority('medium')
      setProjectId(defaultProjectId ?? '')
    }
  }, [open, defaultProjectId])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    const form = e.currentTarget
    const formData = new FormData(form)
    formData.set('priority', priority)
    formData.set('projectId', projectId)
    try {
      await createTask(formData)
      toast.success('Task created!')
      setOpen(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to create task.')
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
            <DialogTitle className="text-lg font-bold text-black">New Task</DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Add a task to track your team's work.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="task-title" className="text-sm font-medium text-slate-700">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="task-title"
                name="title"
                placeholder="e.g. Design landing page"
                required
                className="bg-white border-slate-200 text-black placeholder:text-slate-400 focus-visible:ring-black"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="task-desc" className="text-sm font-medium text-slate-700">Description</Label>
              <Textarea
                id="task-desc"
                name="description"
                placeholder="What needs to be done?"
                rows={2}
                className="bg-white border-slate-200 text-black placeholder:text-slate-400 focus-visible:ring-black resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Priority */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="bg-white border-slate-200 text-black focus:ring-black h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-black">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Due date */}
              <div className="space-y-1.5">
                <Label htmlFor="task-due" className="text-sm font-medium text-slate-700">Due Date</Label>
                <Input
                  id="task-due"
                  name="dueDate"
                  type="date"
                  className="bg-white border-slate-200 text-black focus-visible:ring-black h-9"
                />
              </div>
            </div>

            {/* Project (optional) */}
            {projects && projects.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Project</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger className="bg-white border-slate-200 text-black focus:ring-black h-9">
                    <SelectValue placeholder="Select project (optional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-black">
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
              disabled={isLoading}
              className="bg-black hover:bg-slate-800 text-white"
            >
              {isLoading ? 'Adding…' : 'Add Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
