import React from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  Camera,
  CheckCircle2,
  CircleDollarSign,
  Lightbulb,
  Mic,
  PieChart,
  Receipt,
  Sparkles,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Brand from '../components/Brand'
import financeWorkspace from '../assets/jakub-zerdzicki-heiYgqp0Tsk-unsplash.jpg'
import ghanaCedis from '../assets/ghana-cedis.jpg'

const steps = [
  {
    icon: Sparkles,
    title: 'Log effortlessly with AI',
    description:
      'Type casually like "Spent 45 cedis at KFC yesterday", speak with voice, or snap a receipt photo. Gemini extracts amounts, dates, and categories in seconds.',
  },
  {
    icon: CircleDollarSign,
    title: 'Auto-categorize & budget',
    description:
      'WatchMoni organizes transactions into clean categories and tracks your monthly spending limits so you never overspend.',
  },
  {
    icon: Lightbulb,
    title: 'Actionable AI financial insights',
    description:
      'Receive personalized health scores, savings recommendations, and smart tips tailored to your actual spending habits.',
  },
]

const aiFeatures = [
  {
    icon: Zap,
    title: 'Natural Language Quick-Log',
    badge: 'Gemini 3.8 Flash',
    description:
      'No more filling tedious forms. Type everyday sentences with currencies (GHS, $, €) or relative dates like "yesterday" or "last Friday".',
  },
  {
    icon: Camera,
    title: 'Multimodal Receipt & Invoice OCR',
    badge: 'Gemini Vision',
    description:
      'Upload paper receipts or digital PDFs. The vision model reads merchant names, grand totals, and line items with high precision.',
  },
  {
    icon: Mic,
    title: 'Voice-to-Expense Logging',
    badge: 'Hands-Free',
    description:
      'On the go? Tap the microphone and speak your expenses naturally. WatchMoni transcribes and records them immediately.',
  },
  {
    icon: PieChart,
    title: 'Smart Spending Advisor',
    badge: 'AI Insights',
    description:
      'AI monitors your monthly cash flow, detects category overruns, and computes your savings rate with concrete advice.',
  },
]

const GetStarted = () => (
  <main className="min-h-screen bg-background">
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-8 sm:py-5 lg:px-12">
        <Brand />
        <div className="flex shrink-0 items-center">
          <Link
            to="/login"
            className="rounded-lg px-3 py-2 text-sm font-bold text-text transition hover:bg-surface hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-4"
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>

    {/* Hero Section */}
    <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-8 sm:px-8 sm:pb-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-12 lg:pb-24 lg:pt-14">
      <div className="max-w-xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/90 px-3.5 py-1.5 text-xs font-bold text-indigo-700 shadow-xs sm:text-sm">
          <Sparkles size={16} className="text-primary" />
          <span>Powered by Gemini AI · Smart Logging & Insights</span>
        </div>

        <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-text sm:text-5xl lg:text-6xl">
          Track your money with the speed of <span className="text-primary">AI.</span>
        </h1>

        <p className="mt-5 max-w-lg text-base leading-7 text-muted sm:text-lg sm:leading-8">
          Type naturally like texting a friend, speak hands-free, or snap a photo of any receipt. WatchMoni’s AI extracts amounts, dates, and categories in seconds—plus gives you personalized spending advice.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/register"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-sm transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Get started for free
            <ArrowRight size={18} />
          </Link>
          <Link
            to="/login"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-surface px-6 text-sm font-bold text-text transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            I already have an account
          </Link>
        </div>
        <p className="mt-4 text-xs font-medium text-muted sm:text-sm">
          Zero spreadsheet frustration · Free personal finance assistant
        </p>
      </div>

      {/* Interactive AI Preview Mockup */}
      <div className="relative mx-auto w-full max-w-lg lg:mr-0">
        <div className="absolute -right-8 -top-8 h-44 w-44 rounded-full bg-indigo-200/50 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative rounded-3xl border border-indigo-100 bg-white/95 p-5 shadow-xl sm:p-6">
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-primary" />
              <span className="text-xs font-bold text-slate-800 sm:text-sm">Smart AI Assistant</span>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
              Live Demo
            </span>
          </div>

          {/* Sample AI Input */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <p className="text-xs font-medium text-slate-400">Natural Language Prompt</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              "Spent 45 cedis on lunch at KFC yesterday"
            </p>
          </div>

          {/* Extracted Output Chips */}
          <div className="mt-4 space-y-2.5">
            <p className="text-xs font-bold text-slate-500">✨ AI Extracted in 0.8s:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">
                <span className="text-slate-400">Title:</span>
                <p className="font-bold text-slate-800">KFC Lunch</p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">
                <span className="text-slate-400">Amount:</span>
                <p className="font-bold text-rose-600">-GHS 45.00</p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">
                <span className="text-slate-400">Category:</span>
                <p className="font-bold text-indigo-700">Food & Dining</p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">
                <span className="text-slate-400">Date:</span>
                <p className="font-bold text-slate-800">Yesterday (Calculated)</p>
              </div>
            </div>
          </div>

          {/* Quick receipt scan pill */}
          <div className="mt-4 flex items-center justify-between rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 p-3">
            <div className="flex items-center gap-2">
              <Camera size={16} className="text-indigo-600" />
              <span className="text-xs font-semibold text-slate-700">Receipt & Invoice OCR</span>
            </div>
            <span className="text-xs font-bold text-indigo-600">Scan & Itemize →</span>
          </div>
        </div>

        {/* Floating badge */}
        <div className="absolute -bottom-6 left-4 flex max-w-[calc(100%-2rem)] items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-lg sm:bottom-4 sm:left-[-1.5rem] sm:max-w-xs sm:p-4">
          <img src={ghanaCedis} alt="Ghana Cedis" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-text sm:text-sm">Zero Guesswork</p>
            <p className="text-xs text-muted">Smart tracking helps you keep more cedis in your pocket.</p>
          </div>
          <ArrowUpRight className="ml-auto shrink-0 text-teal" size={18} aria-hidden="true" />
        </div>
      </div>
    </section>

    {/* AI Capabilities Section */}
    <section className="border-t border-border bg-slate-50/60 py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-wider text-primary sm:text-sm">
            AI-Powered Features
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
            Everything you need, automated by AI
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            Spend less time entering numbers and more time reaching your financial goals.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {aiFeatures.map(({ icon: Icon, title, badge, description }) => (
            <div
              key={title}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-primary">
                    <Icon size={20} />
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                    {badge}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-bold text-text">{title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted sm:text-sm">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* 3 Simple Steps */}
    <section className="border-t border-border bg-surface/70 py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-wider text-teal sm:text-sm">
            How WatchMoni Works
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
            Three simple steps to financial clarity
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            You don't need to be an accountant. Start with what you spend, and WatchMoni handles the rest.
          </p>
        </div>

        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, description }, index) => (
            <li key={title} className="rounded-2xl border border-border bg-white p-6 shadow-xs">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint/60 text-teal">
                <Icon size={22} aria-hidden="true" />
              </div>
              <p className="mt-5 text-xs font-bold uppercase tracking-wider text-muted">
                Step {index + 1}
              </p>
              <h3 className="mt-1 text-lg font-bold text-text">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
            </li>
          ))}
        </ol>

        {/* CTA Banner */}
        <div className="mt-12 flex flex-col items-start justify-between gap-5 rounded-2xl bg-primary px-6 py-8 text-white sm:flex-row sm:items-center sm:px-10">
          <div>
            <h2 className="text-2xl font-bold">Ready to take control with AI?</h2>
            <p className="mt-1 text-sm text-white/80">
              Create your account in under a minute and start tracking smarter.
            </p>
          </div>
          <Link
            to="/register"
            className="get-started-account-button inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-primary shadow-sm transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Create an account
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  </main>
)

export default GetStarted
