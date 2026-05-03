import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logout } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'
import { BookOpen, LayoutDashboard, FileText, Upload, ArrowLeft, Bell, Terminal } from 'lucide-react'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const [{ data: { user } }] = await Promise.all([supabase.auth.getUser()])

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()

  if (!profile?.is_admin) {
    // TEMPORARILY DISABLED FOR DEV:
    // redirect('/dashboard')
    console.log("Bypassing admin check for dev")
  }

  const initial = (user.email?.[0] || 'A').toUpperCase()

  return (
    <div className="min-h-screen bg-background flex">
      {/* Admin Sidebar */}
      <aside className="w-[240px] flex flex-col fixed top-0 left-0 h-screen z-40 hidden md:flex border-r border-border bg-surface/80 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-6 h-[72px] border-b border-border">
          <div className="size-9 rounded-xl bg-surface-2 border border-border grid place-items-center">
            <Terminal className="h-4 w-4 text-accent-cyan" />
          </div>
          <span className="font-bold text-[17px] text-foreground tracking-tight">Admin Panel</span>
        </div>

        <nav className="flex flex-col gap-1 px-4 mt-4 flex-1">
          <Link href="/dashboard" className="group flex items-center gap-3 rounded-xl px-4 py-2.5 text-muted-2 text-sm font-medium hover:bg-surface-2 hover:text-foreground transition-all">
            <ArrowLeft className="h-[18px] w-[18px]" />
            Back to App
          </Link>
          <div className="h-px bg-border my-3" />
          <span className="px-4 text-[10px] uppercase tracking-widest text-muted-2/60 font-bold mb-1">Admin</span>
          <Link href="/admin" className="group flex items-center gap-3 rounded-xl px-4 py-2.5 text-muted-2 text-sm font-medium hover:bg-surface-2 hover:text-foreground transition-all">
            <LayoutDashboard className="h-[18px] w-[18px]" />
            Dashboard
          </Link>
          <Link href="/admin" className="group flex items-center gap-3 rounded-xl px-4 py-2.5 text-muted-2 text-sm font-medium hover:bg-surface-2 hover:text-foreground transition-all">
            <FileText className="h-[18px] w-[18px]" />
            Questions
          </Link>
          <Link href="/admin/import" className="group flex items-center gap-3 rounded-xl px-4 py-2.5 text-muted-2 text-sm font-medium hover:bg-surface-2 hover:text-foreground transition-all">
            <Upload className="h-[18px] w-[18px]" />
            Import
          </Link>
        </nav>

        <div className="px-4 pb-5 border-t border-border pt-4">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-surface-2 border border-border">
            <div className="size-9 rounded-full bg-surface-2 border border-border-strong flex items-center justify-center text-accent-cyan text-sm font-bold">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.email?.split('@')[0]}</p>
              <p className="text-[11px] text-muted-2">Admin</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 md:ml-[240px] flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 h-[72px] flex items-center justify-between px-8 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="hidden md:block" />
          <div className="flex items-center gap-4 ml-auto">
            <button className="relative p-2 rounded-xl hover:bg-surface-2 transition-colors">
              <Bell className="h-5 w-5 text-muted" />
            </button>
            <div className="h-8 w-px bg-border" />
            <span className="text-sm font-medium text-muted">{user.email}</span>
            <form action={logout}>
              <Button type="submit" variant="outline" size="sm">
                Log out
              </Button>
            </form>
          </div>
        </header>

        <main className="flex-1 p-8 max-w-[1180px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
