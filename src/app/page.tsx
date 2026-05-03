'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Spline from '@splinetool/react-spline'
import { ArrowRight, Brain, Trophy, Activity } from 'lucide-react'
import { Nav } from '@/components/site/nav'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-hidden">
      <Nav />

      {/* ── Hero Section ── */}
      <main className="relative pt-32 lg:pt-44">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[140px] -z-10"
          style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)' }} />
        <div className="pointer-events-none absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] -z-10"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)' }} />

        <section className="mx-auto max-w-7xl px-6 pb-24 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-8 z-10"
          >
            <Badge>New 3D Visualizer</Badge>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-[0.95] font-extrabold tracking-[-0.04em]">
              Master JEE<br />
              with a <span className="text-gradient">Problem-Solving</span><br />
              focus.
            </h1>

            <p className="text-base md:text-lg text-muted leading-relaxed max-w-prose">
              Step away from passive reading. Engage with high-yield physics, chemistry, and mathematics problems designed specifically for competitive excellence.
            </p>

            <div className="flex items-center gap-4 mt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 h-12 px-7 text-base font-medium rounded-pill bg-gradient-primary text-white shadow-[0_8px_24px_-6px_rgba(37,99,235,0.55)] hover:brightness-110 active:brightness-95 transition-all"
              >
                Enter Platform
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="flex items-center gap-6 text-muted-2 text-sm font-medium">
              <div className="flex items-center gap-2">
                <CheckCircleIcon /> 5,000+ Curated Problems
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon /> Interactive 3D Visuals
              </div>
            </div>
          </motion.div>

          {/* Right: 3D visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="relative aspect-square rounded-2xl border border-border bg-surface overflow-hidden hidden lg:flex items-center justify-center"
          >
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.06) 0%, rgba(37,99,235,0.06) 100%)' }} />
            {/* Thin neon axis lines */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-accent-cyan/10" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-accent-cyan/10" />
            <Spline scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode" className="w-full h-full" />
          </motion.div>
        </section>

        {/* ── Feature Section ── */}
        <section id="features" className="border-t border-border bg-surface/40">
          <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-2xl mx-auto mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Reimagining <span className="text-gradient">Exam Prep</span>
              </h2>
              <p className="text-muted text-base md:text-lg leading-relaxed">
                Everything you need to analyze your weaknesses, track your streak, and dominate the exam.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard
                icon={<Brain className="w-6 h-6 text-accent-cyan" />}
                title="Smart Difficulty Scaling"
                desc="Problems adapt to your skill level. Start with basic concepts and progress to advanced Olympiad-level questions."
                delay={0.1}
              />
              <FeatureCard
                icon={<Activity className="w-6 h-6 text-accent-blue" />}
                title="Granular Analytics"
                desc="Visualize your performance with dynamic heatmaps and topic-by-topic mastery charts that pinpoint what to study next."
                delay={0.2}
              />
              <FeatureCard
                icon={<Trophy className="w-6 h-6 text-accent-cyan" />}
                title="Global Leaderboard"
                desc="Compete with thousands of aspirants. Maintain your daily streak to climb the ranks and stay motivated."
                delay={0.3}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function CheckCircleIcon() {
  return (
    <svg className="w-4 h-4 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode; title: string; desc: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="p-8 rounded-2xl border border-border bg-surface/60 hover:bg-surface transition-colors group relative overflow-hidden"
    >
      {/* Top gradient line on hover */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="w-12 h-12 rounded-xl bg-surface-2 border border-border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-3 text-foreground">{title}</h3>
      <p className="text-muted text-sm leading-relaxed">{desc}</p>
    </motion.div>
  )
}
