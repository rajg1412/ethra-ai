'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { signup } from '../actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Eye, EyeOff, UserPlus as UserPlusIcon } from 'lucide-react'

function SignupContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden px-4">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 bg-black rounded flex items-center justify-center shadow-sm mb-4">
            <UserPlusIcon className="text-white w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-black tracking-tight">Create Account</h1>
          <p className="text-slate-500 mt-1 text-sm text-center">Join Ethra and start managing your team</p>
        </div>

        <Card className="bg-white border-slate-200 shadow-xl rounded-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-black font-bold">Sign Up</CardTitle>
            <CardDescription className="text-slate-500">
              Enter your details to create your workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form action={signup} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName" className="text-slate-700 text-sm font-medium">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="John Doe"
                  required
                  autoComplete="name"
                  className="bg-white border-slate-200 text-black placeholder:text-slate-400 focus-visible:ring-black rounded-lg transition-all"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-slate-700 text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  autoComplete="email"
                  className="bg-white border-slate-200 text-black placeholder:text-slate-400 focus-visible:ring-black rounded-lg transition-all"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-slate-700 text-sm font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    className="bg-white border-slate-200 text-black focus-visible:ring-black rounded-lg transition-all pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-black"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword" className="text-slate-700 text-sm font-medium">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    className="bg-white border-slate-200 text-black focus-visible:ring-black rounded-lg transition-all pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((current) => !current)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-black"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full bg-black hover:bg-slate-800 text-white font-bold py-5 rounded-lg transition-all mt-2">
                Create Account
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 border-t border-slate-50 pt-6">
            <p className="text-sm text-center text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="text-black hover:underline font-bold transition-all">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupContent />
    </Suspense>
  )
}
