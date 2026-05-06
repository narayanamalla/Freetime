'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Spline from '@splinetool/react-spline'
import { ArrowRight, Brain, Trophy, Activity, Zap, CheckCircle2 } from 'lucide-react'
import { Nav } from '@/components/site/nav'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans overflow-x-hidden relative">
      <Nav />

      <main className="relative pt-32 lg:pt-40">
        <section className="mx-auto max-w-[1400px] px-6 pb-24 grid lg:grid-cols-[1fr_1fr] gap-16 lg:gap-10 items-center">
          
          {/* Left Column: Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-8 z-10 max-w-[600px]"
          >
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white/50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
              <span className="size-1.5 rounded-full bg-blue-500" />
              Adaptive Practice
            </div>

            {/* Heading */}
            <h1 className="text-[3.5rem] sm:text-[4.5rem] lg:text-[5.5rem] leading-[1.05] font-extrabold tracking-tight font-serif text-slate-900">
              Master JEE <br />
              with <span className="text-blue-500">depth-first</span> <br />
              problem solving.
            </h1>

            {/* Description */}
            <p className="text-[17px] text-slate-500 leading-relaxed font-medium">
              A focused workspace for physics, chemistry, and mathematics — with analytics that surface what to drill next, not just how many questions you clicked.
            </p>

            {/* Actions */}
            <div className="flex items-center gap-6 mt-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 h-14 px-8 text-[15px] font-bold rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
              >
                Enter platform
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center h-14 px-8 text-[15px] font-bold rounded-full bg-white text-slate-700 hover:bg-slate-50 transition-all border border-slate-200/60"
              >
                Sign in
              </Link>
            </div>

            {/* Features below buttons */}
            <div className="flex flex-wrap items-center gap-8 text-slate-400 text-[13px] font-semibold mt-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500" />
                High-yield question sets
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                3D-ready visualizations
              </div>
            </div>
          </motion.div>

          {/* Right Column: Visual Showcase */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:block h-[700px] w-full"
          >
            {/* Dark Container */}
            <div className="absolute inset-y-0 right-0 left-12 bg-[#111113] rounded-[40px] shadow-2xl overflow-hidden flex items-center justify-center">
              
              {/* Spline Canvas overlay grid lines to match image */}
              <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-0 bottom-1/2 left-[55%] w-px bg-green-500" />
                <div className="absolute top-[60%] bottom-0 left-[25%] w-px bg-blue-500 rotate-[30deg]" />
                <div className="absolute top-[60%] right-0 w-1/2 h-px bg-red-500 rotate-[15deg]" />
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-tr from-[#111113] via-transparent to-[#111113] z-10 pointer-events-none" />
              
              <Spline scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode" className="w-full h-full scale-[1.1] z-0" />
            </div>

            {/* Floating Badges */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-[8%] bottom-[20%] bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] p-4 flex items-center gap-4 shadow-xl z-20 min-w-[200px]"
            >
              <div className="size-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                <Activity className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white leading-tight">98%</p>
                <p className="text-[11px] text-white/50 font-semibold mt-0.5">Accuracy Rate</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1, ease: [0.22, 1, 0.36, 1] }}
              className="absolute -right-4 top-[30%] bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] p-4 flex items-center gap-4 shadow-xl z-20 min-w-[220px]"
            >
              <div className="size-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Trophy className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white leading-tight">1,200+</p>
                <p className="text-[11px] text-white/50 font-semibold mt-0.5">Practice Questions</p>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-white border-t border-slate-100">
          <div className="mx-auto max-w-[1400px] px-6 py-24 md:py-32 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-2xl mx-auto mb-16 md:mb-20"
            >
              <p className="text-sm font-bold tracking-widest uppercase text-blue-500 mb-4">Product</p>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-5 text-slate-900 tracking-tight font-serif">
                Built for serious prep
              </h2>
              <p className="text-slate-500 text-[17px] font-medium leading-relaxed">
                Clear hierarchy, fast navigation, and feedback loops that mirror how top performers actually train.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Brain className="w-6 h-6 text-blue-500" />}
                title="Difficulty that scales"
                desc="Move from fundamentals to exam tempo without jumping into chaos — stay in the stretch zone."
                delay={0.1}
              />
              <FeatureCard
                icon={<Activity className="w-6 h-6 text-orange-500" />}
                title="Analytics you can act on"
                desc="See streaks, accuracy, and topic load — so your next session is a decision, not a guess."
                delay={0.2}
              />
              <FeatureCard
                icon={<Trophy className="w-6 h-6 text-green-500" />}
                title="Motivation without noise"
                desc="Leaderboards and streaks that reward consistency — tuned to feel premium, not arcade-y."
                delay={0.3}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  desc,
  delay,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-slate-900">{title}</h3>
      <p className="text-slate-500 text-[15px] font-medium leading-relaxed">{desc}</p>
    </motion.div>
  )
}
