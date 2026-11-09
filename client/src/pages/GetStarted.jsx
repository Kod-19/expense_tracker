import React from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CircleDollarSign,
  ClipboardList,
  PieChart,
  Sparkles,
  Wallet,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Brand from '../components/Brand'
import financeWorkspace from '../assets/jakub-zerdzicki-heiYgqp0Tsk-unsplash.jpg'
import ghanaCedis from '../assets/ghana-cedis.jpg'

const steps = [
  {
    icon: ClipboardList,
    title: 'Record your money',
    description:
      'Log what you receive and spend. Enter details manually, type plain sentences like "Spent 45 cedis on lunch", speak with voice, or scan a paper receipt.',
  },
  {
    icon: CircleDollarSign,
    title: 'Plan your spending',
    description:
      'Organize transactions into custom categories and set monthly limits so you always know how much you have left.',
  },
  {
    icon: PieChart,
    title: 'See how you are doing',
    description:
      'Use your dashboard to review your net balance, monthly trends, spending breakdowns, and personalized financial tips.',
  },
]

const features = [
  {
    icon: Wallet,
    title: 'Income & Expense Tracking',
    description:
      'Keep an organized record of all money coming in and going out. Track payment methods, dates, and notes, with full search and filtering.',
  },
  {
    icon: Sparkles,
    title: 'Smart AI Quick-Log & Receipts',
    description:
      'Powered by Google Gemini. Type casually (e.g., "Spent 45 cedis on lunch at KFC yesterday"), speak hands-free with voice dictation, or upload receipt photos for instant data extraction.',
  },
  {
    icon: CircleDollarSign,
    title: 'Category Spending Budgets',
    description:
      'Create monthly spending limits for categories like Food, Transport, or Bills. Track your progress with clear warnings before you overspend.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard & Smart Insights',
    description:
      'Understand your cash flow through visual charts and summary cards. Built-in AI calculates your savings rate and shares personalized suggestions to improve your financial health.',
  },
]

const GetStarted = () => (
  <main className="min-h-screen bg-background">
    {/* Navigation */}
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xs">
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
    <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-8 sm:px-8 sm:pb-20 lg:grid-cols-[1fr_0.95fr] lg:gap-16 lg:px-12 lg:pb-24 lg:pt-12">
      <div className="max-w-xl">
        <p className="inline-flex items-center gap-2 rounded-full bg-mint/60 px-3 py-1.5 text-sm font-bold text-teal">
          <span className="h-2 w-2 rounded-full bg-teal" />
          A clearer view of your money
        </p>

        <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-text sm:text-5xl lg:text-6xl">
          Make your money easier to <span className="text-primary">understand.</span>
        </h1>

        <p className="mt-5 max-w-lg text-base leading-7 text-muted sm:text-lg sm:leading-8">
          WatchMoni helps you keep track of what comes in, what goes out, and what you save. Record transactions, organize custom categories, set monthly budgets, and see where your money goes without complex spreadsheets.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/register"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-xs transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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

        <p className="mt-4 text-sm text-muted">
          Your personal finances, organized in one simple place.
        </p>
      </div>

      {/* Clean Right Visual */}
      <div className="mx-auto w-full max-w-xl lg:mr-0">
        <img
          src={financeWorkspace}
          alt="Notebook, calculator, and charts ready for planning finances"
          className="h-[280px] w-full rounded-2xl border border-border object-cover shadow-sm sm:h-[360px]"
        />

        {/* Supporting Callout Cleanly Below the Image */}
        <div className="mt-4 flex items-center gap-3.5 rounded-xl border border-border bg-surface p-3.5 shadow-xs">
          <img src={ghanaCedis} alt="Ghana Cedis" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-text">Simple, practical tracking</p>
            <p className="text-xs text-muted">
              Record daily spending in GHS, manage budgets, and make confident financial decisions.
            </p>
          </div>
          <ArrowUpRight className="ml-auto shrink-0 text-teal" size={18} aria-hidden="true" />
        </div>
      </div>
    </section>

    {/* App Features Grid with AI details */}
    <section className="border-t border-border bg-surface/70 py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-wider text-teal sm:text-sm">
            Core Features
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
            Everything you need to manage your money
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            WatchMoni brings your transactions, categories, budgets, and smart logging tools together in a simple layout.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-surface p-5 shadow-xs"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint/60 text-teal">
                <Icon size={20} />
              </div>
              <h3 className="mt-4 text-base font-bold text-text">{title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted sm:text-sm">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* 3 Simple Steps */}
    <section className="border-t border-border bg-background py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-wider text-teal sm:text-sm">
            How WatchMoni Works
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
            Three simple steps to get started
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            You don’t need to be a finance expert. Start with what you know, and build a clearer picture over time.
          </p>
        </div>

        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, description }, index) => (
            <li key={title} className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
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
            <h2 className="text-2xl font-bold">Ready to get a better view of your money?</h2>
            <p className="mt-1 text-sm text-white/80">
              Create your account and start organizing your finances today.
            </p>
          </div>
          <Link
            to="/register"
            className="get-started-account-button inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-primary shadow-xs transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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
