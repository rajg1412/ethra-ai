'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <Card className="w-full max-w-md border-slate-200 bg-white shadow-none">
        <CardHeader>
          <CardTitle className="text-base font-bold text-black">Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">{error.message}</p>
          <Button onClick={() => reset()} className="bg-black text-white hover:bg-slate-800">
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
