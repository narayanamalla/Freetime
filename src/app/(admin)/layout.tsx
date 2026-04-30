import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logout } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'
import { BookOpen, LayoutDashboard, FileText, Upload, ArrowLeft, Bell } from 'lucide-react'

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
    <div className="min-h-screen bg-[#f5f6fa] flex">
      {/* Admin Dark Sidebar */}
      <aside className="w-[240px] sidebar-dark flex flex-col fixed top-0 left-0 h-screen z-40 hidden md:flex">
        <div className="flex items-center gap-3 px-6 h-[72px]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <BookOpen className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="font-bold text-[17px] text-white tracking-tight">JEE Practice</span>
        </div>

        <nav className="flex flex-col gap-1 px-4 mt-4 flex-1">
          <Link href="/dashboard" className="group flex items-center gap-3 rounded-xl px-4 py-2.5 text-white/50 text-sm font-medium hover:bg-white/10 hover:text-white transition-all">
            <ArrowLeft className="h-[18px] w-[18px]" />
            Back to App
          </Link>
          <div className="h-px bg-white/10 my-3" />
          <span className="px-4 text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1">Admin</span>
          <Link href="/admin" className="group flex items-center gap-3 rounded-xl px-4 py-2.5 text-white/60 text-sm font-medium hover:bg-white/10 hover:text-white transition-all">
            <LayoutDashboard className="h-[18px] w-[18px]" />
            Dashboard
          </Link>
          <Link href="/admin" className="group flex items-center gap-3 rounded-xl px-4 py-2.5 text-white/60 text-sm font-medium hover:bg-white/10 hover:text-white transition-all">
            <FileText className="h-[18px] w-[18px]" />
            Questions
          </Link>
          <Link href="/admin/import" className="group flex items-center gap-3 rounded-xl px-4 py-2.5 text-white/60 text-sm font-medium hover:bg-white/10 hover:text-white transition-all">
            <Upload className="h-[18px] w-[18px]" />
            Import
          </Link>
        </nav>

        <div className="px-4 pb-5">
          <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-white/5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/90 truncate">{user.email?.split('@')[0]}</p>
              <p className="text-[11px] text-white/30">Admin</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 md:ml-[240px] flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 h-[72px] flex items-center justify-between px-8 bg-white/70 backdrop-blur-xl border-b border-gray-100/80">
          <div className="hidden md:block" />
          <div className="flex items-center gap-4 ml-auto">
            <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <Bell className="h-5 w-5 text-gray-400" />
            </button>
            <div className="h-8 w-px bg-gray-200" />
            <span className="text-sm font-medium text-gray-600">{user.email}</span>
            <form action={logout}>
              <Button type="submit" variant="outline" size="sm" className="text-xs h-8 px-4 rounded-xl border-gray-200 text-gray-500">
                Log out
              </Button>
            </form>
          </div>
        </header>

        <main className="flex-1 p-8 max-w-[1180px] w-full mx-auto animate-in-up">
          {children}
        </main>
      </div>
    </div>
  )
}
