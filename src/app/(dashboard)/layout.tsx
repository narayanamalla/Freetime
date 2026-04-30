import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logout } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'
import { BookOpen, LayoutDashboard, GraduationCap, Bookmark, FlaskConical, Bell } from 'lucide-react'

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
    <div className="min-h-screen bg-[#f5f6fa] flex">
      {/* Dark Sidebar */}
      <aside className="w-[240px] sidebar-dark flex flex-col fixed top-0 left-0 h-screen z-40 hidden md:flex">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-[72px]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <BookOpen className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="font-bold text-[17px] text-white tracking-tight">JEE Practice</span>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-1 px-4 mt-4 flex-1">
          <SidebarLink href="/dashboard" icon={<LayoutDashboard className="h-[18px] w-[18px]" />} label="Dashboard" />
          <SidebarLink href="/subjects" icon={<BookOpen className="h-[18px] w-[18px]" />} label="Subjects" />
          <SidebarLink href="/subjects" icon={<FlaskConical className="h-[18px] w-[18px]" />} label="Practice" />
          <SidebarLink href="/subjects" icon={<GraduationCap className="h-[18px] w-[18px]" />} label="Tests" disabled />
          <SidebarLink href="/subjects" icon={<Bookmark className="h-[18px] w-[18px]" />} label="Bookmarks" disabled />
        </nav>

        {/* Bottom user */}
        <div className="px-4 pb-5">
          <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-white/5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-indigo-500/20">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/90 truncate">{user.email?.split('@')[0]}</p>
              <p className="text-[11px] text-white/40 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 md:ml-[240px] flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-[72px] flex items-center justify-between px-8 bg-white/70 backdrop-blur-xl border-b border-gray-100/80">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm">JEE Practice</span>
          </div>
          <div className="hidden md:block" />

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <Bell className="h-5 w-5 text-gray-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="h-8 w-px bg-gray-200" />
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                {initial}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:inline">{user.email}</span>
            </div>
            <form action={logout}>
              <Button type="submit" variant="outline" size="sm" className="text-xs h-8 px-4 rounded-xl border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300">
                Log out
              </Button>
            </form>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8 max-w-[1180px] w-full mx-auto animate-in-up">
          {children}
        </main>
      </div>
    </div>
  )
}

function SidebarLink({ href, icon, label, disabled }: { href: string; icon: React.ReactNode; label: string; disabled?: boolean }) {
  if (disabled) {
    return (
      <div className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-white/25 text-sm cursor-not-allowed">
        {icon}
        <span>{label}</span>
      </div>
    )
  }
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl px-4 py-2.5 text-white/60 text-sm font-medium transition-all hover:bg-white/10 hover:text-white"
    >
      <span className="transition-transform group-hover:scale-110">{icon}</span>
      <span>{label}</span>
    </Link>
  )
}
