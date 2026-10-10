import { ArrowRight, ArrowUpRight, CircleDollarSign, ClipboardList, PieChart } from 'lucide-react'
import { Link } from 'react-router-dom'
import Brand from '../components/Brand'
import ThemeToggle from '../components/ThemeToggle'
import financeWorkspace from '../assets/jakub-zerdzicki-heiYgqp0Tsk-unsplash.jpg'
import ghanaCedis from '../assets/ghana-cedis.jpg'

const steps = [
  {
    icon: ClipboardList,
    title: 'Record your money',
    description: 'Add the money you receive and the things you spend it on.',
  },
  {
    icon: CircleDollarSign,
    title: 'Plan your spending',
    description: 'Organize expenses into categories and set budgets that suit you.',
  },
  {
    icon: PieChart,
    title: 'See how you are doing',
    description: 'Use your dashboard to understand your spending at a glance.',
  },
]

const GetStarted = () => (
  <main className="min-h-screen bg-background">
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-8 sm:py-5 lg:px-12">
        <Brand />
        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/login"
            className="rounded-lg px-3 py-2 text-sm font-bold text-text transition hover:bg-surface hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-4"
          >
            Sign in
          </Link>
          <ThemeToggle className="static" />
        </div>
      </div>
    </header>

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
          WatchMoni helps you keep track of what comes in, what goes out, and what you want to save for. No guesswork—just a simple picture of your everyday money.
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
        <p className="mt-4 text-sm text-muted">Your finances, organized in one easy-to-use place.</p>
      </div>

      <div className="relative mx-auto w-full max-w-xl lg:mr-0">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-mint/70 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <img
          src={financeWorkspace}
          alt="Notebook, calculator, and charts ready for planning finances"
          className="relative h-[280px] w-full rounded-3xl object-cover shadow-xl sm:h-[380px]"
        />
        <div className="absolute -bottom-5 left-4 flex max-w-[calc(100%-2rem)] items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-lg sm:bottom-6 sm:left-[-2rem] sm:max-w-xs sm:p-4">
          <img src={ghanaCedis} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-text">Small steps add up</p>
            <p className="mt-1 text-xs leading-5 text-muted">A little awareness can make everyday money choices easier.</p>
          </div>
          <ArrowUpRight className="ml-auto shrink-0 text-teal" size={20} aria-hidden="true" />
        </div>
      </div>
    </section>

    <section className="border-t border-border bg-surface/70">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-wider text-teal">How WatchMoni works</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
            Three simple steps to get started
          </h2>
          <p className="mt-3 leading-7 text-muted">You do not need to be a finance expert. Start with what you know, and build a clearer picture over time.</p>
        </div>
        <ol className="mt-9 grid gap-4 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, description }, index) => (
            <li key={title} className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint/60 text-teal">
                <Icon size={21} aria-hidden="true" />
              </div>
              <p className="mt-5 text-xs font-bold uppercase tracking-wider text-muted">Step {index + 1}</p>
              <h3 className="mt-1 text-lg font-bold text-text">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
            </li>
          ))}
        </ol>
        <div className="mt-9 flex flex-col items-start justify-between gap-4 rounded-2xl bg-primary px-5 py-6 text-white sm:flex-row sm:items-center sm:px-8">
          <div>
            <h2 className="text-xl font-bold">Ready to get a better view of your money?</h2>
            <p className="mt-1 text-sm text-white/80">Create your account and take the first step.</p>
          </div>
          <Link
            to="/register"
            className="get-started-account-button inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-primary transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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
