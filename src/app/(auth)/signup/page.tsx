'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signup } from '../actions'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Terminal } from 'lucide-react'

const initialState = {
  error: null as string | null,
}

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    return await signup(formData)
  }, initialState)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-xl bg-surface-2 border border-border grid place-items-center">
            <Terminal className="w-6 h-6 text-accent-cyan" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-foreground">Create an account</h1>
            <p className="text-sm text-muted mt-1">Enter your details to join JEE Practice</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-surface p-8 space-y-6">
          {state?.error && (
            <Alert className="bg-red-500/10 border-red-500/20 text-red-400">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <form action={formAction} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">Full Name</Label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                required
                className="w-full bg-surface-2 border border-border rounded-md px-4 py-3 text-foreground placeholder:text-muted-2 focus:border-accent-glow focus:outline-none focus:ring-2 focus:ring-accent-glow/30 transition text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                className="w-full bg-surface-2 border border-border rounded-md px-4 py-3 text-foreground placeholder:text-muted-2 focus:border-accent-glow focus:outline-none focus:ring-2 focus:ring-accent-glow/30 transition text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full bg-surface-2 border border-border rounded-md px-4 py-3 text-foreground placeholder:text-muted-2 focus:border-accent-glow focus:outline-none focus:ring-2 focus:ring-accent-glow/30 transition text-sm"
              />
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isPending}>
              {isPending ? 'Creating account…' : 'Sign up'}
            </Button>
          </form>

          <p className="text-sm text-center text-muted">
            Already have an account?{' '}
            <Link href="/login" className="text-accent-cyan hover:text-accent-glow font-medium transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
