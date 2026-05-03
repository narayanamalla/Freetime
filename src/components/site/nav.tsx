'use client'

import Link from 'next/link'
import { Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Nav() {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-surface-2 border border-border grid place-items-center">
            <Terminal className="w-5 h-5 text-accent-cyan" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">JEE Practice</span>
        </Link>

        {/* Center links */}
        <div className="hidden md:flex items-center gap-10 text-sm font-medium text-muted-2">
          <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
          <Link href="#subjects" className="hover:text-foreground transition-colors">Subjects</Link>
          <Link href="#leaderboard" className="hover:text-foreground transition-colors">Leaderboard</Link>
        </div>

        {/* CTA */}
        <Link href="/dashboard" className="inline-flex items-center justify-center h-9 px-5 text-sm font-medium rounded-pill border border-border-strong bg-transparent text-foreground hover:bg-surface-2 transition-colors">
          Start Practicing
        </Link>
      </div>
    </nav>
  )
}
