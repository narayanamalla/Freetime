import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logout } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'
import { BookOpen, LayoutDashboard, GraduationCap, Bookmark, FlaskConical, Bell, Terminal, ClipboardList } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const initial = (user.email?.[0] || 'U').toUpperCase()

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-[240px] flex flex-col fixed top-0 left-0 h-screen z-40 hidden md:flex border-r border-border bg-surface/80 backdrop-blur-xl">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-[72px] border-b border-border">
          <div className="size-9 rounded-xl bg-surface-2 border border-border grid place-items-center">
            <Terminal className="h-4 w-4 text-accent-cyan" />
          </div>
          <span className="font-bold text-[17px] text-foreground tracking-tight">JEE Practice</span>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-1 px-4 mt-4 flex-1">
          <SidebarLink href="/dashboard" icon={<LayoutDashboard className="h-[18px] w-[18px]" />} label="Dashboard" />
          <SidebarLink href="/subjects" icon={<BookOpen className="h-[18px] w-[18px]" />} label="Subjects" />
          <SidebarLink href="/subjects" icon={<FlaskConical className="h-[18px] w-[18px]" />} label="Practice" />
          <SidebarLink href="/tests" icon={<ClipboardList className="h-[18px] w-[18px]" />} label="Tests" />
          <SidebarLink href="/subjects" icon={<Bookmark className="h-[18px] w-[18px]" />} label="Bookmarks" disabled />
        </nav>

        {/* Bottom user */}
        <div className="px-4 pb-5 border-t border-border pt-4">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-surface-2 border border-border">
            <div className="size-9 rounded-full bg-surface-2 border border-border-strong flex items-center justify-center text-accent-cyan text-sm font-bold">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.email?.split('@')[0]}</p>
              <p className="text-[11px] text-muted-2 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 md:ml-[240px] flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-[72px] flex items-center justify-between px-8 bg-background/80 backdrop-blur-xl border-b border-border">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2">
            <div className="size-8 rounded-xl bg-surface-2 border border-border grid place-items-center">
              <Terminal className="h-4 w-4 text-accent-cyan" />
            </div>
            <span className="font-bold text-sm text-foreground">JEE Practice</span>
          </div>
          <div className="hidden md:block" />

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-xl hover:bg-surface-2 transition-colors">
              <Bell className="h-5 w-5 text-muted" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-glow rounded-full shadow-[0_0_8px_var(--color-accent-glow)]" />
            </button>
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-surface-2 border border-border-strong flex items-center justify-center text-accent-cyan text-sm font-bold">
                {initial}
              </div>
              <span className="text-sm font-medium text-muted hidden sm:inline">{user.email}</span>
            </div>
            <form action={logout}>
              <Button type="submit" variant="outline" size="sm">
                Log out
              </Button>
            </form>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8 max-w-[1180px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

function SidebarLink({ href, icon, label, disabled }: { href: string; icon: React.ReactNode; label: string; disabled?: boolean }) {
  if (disabled) {
    return (
      <div className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-muted-2/40 text-sm cursor-not-allowed">
        {icon}
        <span>{label}</span>
      </div>
    )
  }
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl px-4 py-2.5 text-muted-2 text-sm font-medium transition-all hover:bg-surface-2 hover:text-foreground"
    >
      <span className="transition-transform group-hover:scale-110">{icon}</span>
      <span>{label}</span>
    </Link>
  )
}
