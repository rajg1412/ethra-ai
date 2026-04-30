import React from 'react'
import { Settings, User, Bell, Shield, Key } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/utils/supabase/server'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const initials = (profile?.full_name ?? user?.email ?? 'U')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-black" />
        <div>
          <h1 className="text-2xl font-bold text-black tracking-tight">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your account preferences.</p>
        </div>
      </div>

      {/* Profile */}
      <Card className="bg-white border-slate-200 shadow-none">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-500" />
            <CardTitle className="text-base font-bold text-black">Profile</CardTitle>
          </div>
          <CardDescription className="text-slate-500 text-sm">Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-slate-200">
              <AvatarFallback className="text-xl bg-slate-900 text-white font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-black">{profile?.full_name ?? '—'}</p>
              <p className="text-xs text-slate-400">{profile?.email}</p>
              {profile?.is_admin && (
                <Badge className="bg-black text-white text-[10px] gap-1 mt-1.5 h-5 shadow-none">
                  <Shield className="w-2.5 h-2.5" /> Global Admin
                </Badge>
              )}
            </div>
          </div>

          {/* Form */}
          <form className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-sm font-medium text-slate-700">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  defaultValue={profile?.full_name ?? ''}
                  placeholder="Your full name"
                  className="bg-white border-slate-200 text-black focus-visible:ring-black"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email</Label>
                <Input
                  id="email"
                  defaultValue={profile?.email ?? ''}
                  disabled
                  className="bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>
            <Button type="submit" className="bg-black hover:bg-slate-800 text-white">
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-white border-slate-200 shadow-none">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-slate-500" />
            <CardTitle className="text-base font-bold text-black">Notifications</CardTitle>
          </div>
          <CardDescription className="text-slate-500 text-sm">Configure when you receive notifications.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {[
            { label: 'Task assigned to you', desc: 'When someone assigns a task to you.' },
            { label: 'Project updates', desc: 'When a project you are in is updated.' },
            { label: 'New team member', desc: 'When someone joins your project.' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-black">{item.label}</p>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>
              <button
                className="w-10 h-6 bg-black rounded-full relative transition-colors flex-shrink-0"
                role="switch"
                aria-checked="true"
              >
                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-all" />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="bg-white border-slate-200 shadow-none">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-slate-500" />
            <CardTitle className="text-base font-bold text-black">Security</CardTitle>
          </div>
          <CardDescription className="text-slate-500 text-sm">Manage your password and security settings.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-password" className="text-sm font-medium text-slate-700">New Password</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Enter new password"
              className="bg-white border-slate-200 text-black focus-visible:ring-black max-w-sm"
            />
          </div>
          <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-black hover:text-white hover:border-black transition-all">
            Update Password
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
