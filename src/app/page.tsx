'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'motion/react';
import {
  Sparkles, BookOpen, Brain, Trophy, BarChart3,
  ArrowRight, Star, Zap, Shield, Globe, ChevronDown,
  GraduationCap, Search, MessageSquare, FileText, Activity
} from 'lucide-react';

// Animated counter hook
function useCounter(end: number, duration = 2000, inView = true) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration, inView]);
  return count;
}

// Fade-in-up animation for sections
const FadeUp = ({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 32 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
};

const features = [
  { icon: Brain,          label: 'AI Tutor',        desc: 'Learn from your PDFs with Orbit AI — teach mode explains concepts, test mode quizzes you.', color: '#6366f1' },
  { icon: BarChart3,      label: 'GPA Tracker',     desc: 'Log every semester, visualise your academic trajectory, and get your cumulative GPA instantly.', color: '#10b981' },
  { icon: Search,         label: 'Research Engine', desc: 'Live Serper-powered scholarly search with AI-generated insights, research gaps, and citation export.', color: '#f27d26' },
  { icon: BookOpen,       label: 'PDF Library',     desc: 'Upload course materials. Orbit extracts the text and makes it context for your AI sessions.', color: '#8b5cf6' },
  { icon: Trophy,         label: 'Leaderboard',     desc: 'Earn XP for every study session, AI interaction, and quiz. Compete with your university cohort.', color: '#eab308' },
  { icon: MessageSquare,  label: 'Campus Chat',     desc: 'Real-time peer messaging with your university community, built for academic collaboration.', color: '#ec4899' },
];

const stats = [
  { value: 1200, suffix: '+', label: 'Active Students' },
  { value: 98,   suffix: '%', label: 'Accuracy Rate' },
  { value: 3,    suffix: 'x', label: 'GPA Improvement' },
  { value: 24,   suffix: '/7', label: 'AI Availability' },
];

const StatCard = ({ s, inView, i }: { s: typeof stats[0]; inView: boolean; i: number }) => {
  const count = useCounter(s.value, 1800, inView);
  return (
    <FadeUp delay={i * 0.1}>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
        <p className="text-3xl lg:text-4xl font-black text-white tabular-nums">{count}{s.suffix}</p>
        <p className="text-sm text-white/50 mt-1 font-medium">{s.label}</p>
      </div>
    </FadeUp>
  );
};

const StatsSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, i) => <div key={s.label}><StatCard s={s} inView={inView} i={i} /></div>)}
    </div>
  );
};

// Floating orbit animation
const FloatingOrb = ({ delay = 0, size = 300, x = 0, y = 0, color = '#f27d26' }: any) => (
  <motion.div
    animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
    transition={{ duration: 6 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    className="absolute pointer-events-none rounded-full blur-3xl opacity-20"
    style={{ width: size, height: size, left: x, top: y, backgroundColor: color }}
  />
);

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-x-hidden">

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 h-16 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#f27d26] flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-[15px] font-black tracking-tight">Orbit</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'About', 'Contact'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-[13px] font-medium text-white/50 hover:text-white transition-colors">{item}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-[13px] font-semibold text-white/60 hover:text-white transition-colors">Sign in</Link>
          <Link href="/login" className="flex items-center gap-1.5 bg-[#f27d26] text-white text-[13px] font-bold px-4 py-2 rounded-xl hover:opacity-90 btn-spring shadow-lg shadow-orange-500/20">
            Get Started <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden pt-16">
        <FloatingOrb size={600} x={-100} y={-100} color="#f27d26" />
        <FloatingOrb size={400} x="60%" y="20%" color="#6366f1" delay={2} />
        <FloatingOrb size={300} x="10%" y="60%" color="#10b981" delay={4} />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-[12px] font-semibold text-white/70 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Now live at Elizade University
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6">
            Your Academic
            <br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #f27d26, #f59e0b)' }}>
              OS, Upgraded.
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[17px] text-white/50 font-medium leading-relaxed max-w-2xl mx-auto mb-10">
            Orbit combines AI tutoring, GPA tracking, research tools, and campus social — 
            built specifically for university students who want to learn smarter.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#f27d26] text-white font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 btn-spring shadow-2xl shadow-orange-500/25 text-[15px]">
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#features"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white/70 font-semibold px-8 py-3.5 rounded-2xl hover:bg-white/10 btn-spring text-[15px]">
              See features <ChevronDown className="w-4 h-4" />
            </a>
          </motion.div>

          {/* Social proof */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-4 mt-10">
            <div className="flex -space-x-2">
              {['E', 'A', 'O', 'T', 'I'].map((l, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#09090b] flex items-center justify-center text-[11px] font-black"
                  style={{ backgroundColor: ['#f27d26', '#6366f1', '#10b981', '#eab308', '#ec4899'][i] }}>
                  {l}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
              <span className="text-[12px] text-white/40 font-medium ml-1">Loved by 1,200+ students</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Hero product preview */}
        <motion.div initial={{ opacity: 0, y: 60, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mt-20 w-full max-w-5xl mx-auto">
          <div className="bg-[#111113] border border-white/10 rounded-2xl p-1 shadow-2xl shadow-black/50">
            <div className="bg-[#0f0f12] rounded-xl overflow-hidden">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                {['bg-red-500', 'bg-yellow-500', 'bg-emerald-500'].map((c, i) => (
                  <div key={i} className={`w-3 h-3 rounded-full ${c} opacity-70`} />
                ))}
                <div className="flex-1 flex justify-center">
                  <div className="bg-white/5 rounded-lg px-6 py-1 text-[11px] text-white/30 font-mono">
                    orbit.elizadeuniversity.edu.ng
                  </div>
                </div>
              </div>
              {/* Dashboard preview */}
              <div className="p-6 grid grid-cols-4 gap-3 opacity-90">
                {[
                  { label: 'Neural Progress', value: '73%', color: '#f27d26' },
                  { label: 'Current GPA', value: '4.52', color: '#10b981' },
                  { label: 'AI Sessions', value: '142', color: '#6366f1' },
                  { label: 'Study Time', value: '48h', color: '#8b5cf6' },
                ].map((card) => (
                  <div key={card.label} className="bg-white/3 border border-white/8 rounded-xl p-3">
                    <p className="text-[9px] text-white/40 uppercase tracking-wider mb-2">{card.label}</p>
                    <p className="text-xl font-bold" style={{ color: card.color }}>{card.value}</p>
                  </div>
                ))}
                <div className="col-span-3 bg-white/3 border border-white/8 rounded-xl p-3">
                  <p className="text-[9px] text-white/40 uppercase tracking-wider mb-3">Activity</p>
                  <div className="flex items-end gap-1.5 h-12">
                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                      <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, backgroundColor: '#f27d26', opacity: 0.6 + (i * 0.06) }} />
                    ))}
                  </div>
                </div>
                <div className="bg-white/3 border border-white/8 rounded-xl p-3 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-4 border-[#f27d26]/30 flex items-center justify-center">
                    <p className="text-xs font-bold text-[#f27d26]">73%</p>
                  </div>
                  <p className="text-[9px] text-white/30 mt-1">Level 3</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/20">
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* ── Stats ── */}
      <section className="py-20 px-6 bg-[#0f0f12] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <StatsSection />
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-16">
              <p className="text-[12px] font-bold text-[#f27d26] uppercase tracking-[0.2em] mb-3">Everything you need</p>
              <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-4">Built for serious students</h2>
              <p className="text-[16px] text-white/40 max-w-xl mx-auto">
                Every feature is designed around how university students actually study, research, and collaborate.
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={f.label}><FadeUp delay={i * 0.08}>
                  <div className="group bg-[#111113] border border-white/8 rounded-2xl p-6 hover:border-white/20 transition-all duration-300 cursor-default">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${f.color}15`, border: `1px solid ${f.color}30` }}>
                      <Icon className="w-5 h-5" style={{ color: f.color }} />
                    </div>
                    <h3 className="text-[15px] font-bold text-white mb-2">{f.label}</h3>
                    <p className="text-[13px] text-white/40 leading-relaxed">{f.desc}</p>
                  </div>
                </FadeUp></div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-28 px-6 bg-[#0f0f12] border-y border-white/5" id="about">
        <div className="max-w-4xl mx-auto">
          <FadeUp className="text-center mb-16">
            <p className="text-[12px] font-bold text-[#f27d26] uppercase tracking-[0.2em] mb-3">Simple by design</p>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight">Up and running in seconds</h2>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Sign up', desc: 'Use your Elizade University email. Your account is verified and ready instantly.' },
              { step: '02', title: 'Upload materials', desc: 'Drop in your lecture PDFs. Orbit extracts the content and makes it AI-ready.' },
              { step: '03', title: 'Learn smarter', desc: 'Chat with Orbit AI about your notes, generate quizzes, track your GPA, and climb the leaderboard.' },
            ].map((s, i) => (
              <div key={s.step}><FadeUp delay={i * 0.12}>
                <div className="relative">
                  {i < 2 && (
                    <div className="hidden md:block absolute top-7 left-full w-full h-px bg-gradient-to-r from-white/10 to-transparent z-10" />
                  )}
                  <div className="bg-[#111113] border border-white/8 rounded-2xl p-6">
                    <p className="text-[11px] font-black text-[#f27d26] tracking-[0.3em] mb-4">{s.step}</p>
                    <h3 className="text-[16px] font-bold text-white mb-2">{s.title}</h3>
                    <p className="text-[13px] text-white/40 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </FadeUp></div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 px-6 relative overflow-hidden">
        <FloatingOrb size={500} x="20%" y="-20%" color="#f27d26" delay={1} />
        <FloatingOrb size={400} x="60%" y="30%" color="#6366f1" delay={3} />
        <FadeUp className="relative z-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#f27d26]/10 border border-[#f27d26]/20 rounded-full px-4 py-2 text-[12px] font-semibold text-[#f27d26] mb-8">
            <Shield className="w-3.5 h-3.5" />
            Free for all Elizade University students
          </div>
          <h2 className="text-5xl lg:text-6xl font-black tracking-tight mb-6">
            Ready to study<br />like a champion?
          </h2>
          <p className="text-[16px] text-white/40 mb-10">
            Join your university on Orbit. No credit card. No setup fees. Just better results.
          </p>
          <Link href="/login"
            className="inline-flex items-center gap-2 bg-[#f27d26] text-white font-bold px-10 py-4 rounded-2xl hover:opacity-90 btn-spring shadow-2xl shadow-orange-500/30 text-[16px]">
            Create your account <ArrowRight className="w-5 h-5" />
          </Link>
        </FadeUp>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 px-6 py-10" id="contact">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#f27d26] flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[14px] font-black">Orbit</span>
          </div>
          <p className="text-[12px] text-white/30">
            Built for Elizade University · {new Date().getFullYear()}
          </p>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-[12px] text-white/40 hover:text-white transition-colors">Sign in</Link>
            <a href="mailto:orbit@elizadeuniversity.edu.ng" className="text-[12px] text-white/40 hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
