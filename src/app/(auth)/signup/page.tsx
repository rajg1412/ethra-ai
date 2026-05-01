'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { signup } from '../actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { UserPlus as UserPlusIcon } from 'lucide-react'

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden px-4">
      {/* Subtle patterns */}
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
            <form action={signup} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName" className="text-slate-700 text-sm font-medium">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="John Doe"
                  required
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
                  className="bg-white border-slate-200 text-black placeholder:text-slate-400 focus-visible:ring-black rounded-lg transition-all"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-slate-700 text-sm font-medium">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="bg-white border-slate-200 text-black focus-visible:ring-black rounded-lg transition-all"
                />
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
