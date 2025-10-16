import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
}

const features = [
  {
    title: 'Expense Tracking',
    desc: 'Categorize, analyze, and visualize your spending in real-time.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-accent" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
      </svg>
    )
  },
  {
    title: 'AI Prediction',
    desc: 'Forecast monthly expenses and cash flow using machine learning.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-accent" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 16l6-6 4 4 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    title: 'Investment Simulation',
    desc: 'Model SIPs and scenarios aligned to your risk profile.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-accent" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 12h4v8H3zM10 8h4v12h-4zM17 4h4v16h-4z" />
      </svg>
    )
  },
  {
    title: 'Budget Planning',
    desc: 'Create, track, and get alerts when you’re nearing limits.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-accent" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 7h16v10H4z" />
        <path d="M8 7v-2h8v2" />
      </svg>
    )
  }
]

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Subtle radial glow */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.15), transparent)' }} />
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-96 w-[42rem] rounded-full blur-3xl" style={{ background: 'color-mix(in oklab, var(--accent) 20%, transparent)' }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <motion.h1 variants={item} className="text-5xl sm:text-6xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>
                Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-cyan-300">AI-Powered</span>{' '}
                Path to Smarter Money
              </motion.h1>
              <motion.p variants={item} className="mt-5 text-lg leading-relaxed max-w-xl" style={{ color: 'var(--text-muted)' }}>
                FinAura helps you take control of your finances with intelligent expense predictions, guided investment simulations, and effortless budget planning — all in one beautiful dashboard.
              </motion.p>
              <motion.div variants={item} className="mt-8 flex flex-wrap gap-3">
                <Link to="/signup" className="btn shadow-[0_0_0_2px_rgba(34,211,238,.15)] ring-1 ring-cyan-500/30">
                  Start Your FinAura Journey
                </Link>
                <Link to="/login" className="btn-secondary">
                  Log In
                </Link>
              </motion.div>
            </div>

            {/* Futuristic device mock */}
            <motion.div variants={item} className="relative">
              <div className="mx-auto w-full max-w-xl rounded-2xl border card-base backdrop-blur p-4 shadow-[0_0_80px_-20px_rgba(34,211,238,.25)]">
                <div className="aspect-video rounded-xl muted-surface border p-4" style={{ borderColor: 'var(--border)' }}>
                  {/* Mock dashboard UI */}
                  <div className="h-6 w-24 rounded" style={{ background: 'var(--bg-muted)' }} />
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="h-24 rounded-lg muted-surface" style={{ border: '1px solid var(--border)' }} />
                    <div className="h-24 rounded-lg muted-surface" style={{ border: '1px solid var(--border)' }} />
                    <div className="h-24 rounded-lg muted-surface" style={{ border: '1px solid var(--border)' }} />
                  </div>
                  <div className="mt-4 h-40 rounded-lg muted-surface" style={{ border: '1px solid var(--border)' }} />
                </div>
                <div className="mt-3 mx-auto h-2 w-24 rounded-full" style={{ background: 'var(--bg-muted)' }} />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className="relative py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold" style={{ color: 'var(--text)' }}>Core Features</h2>
            <p style={{ color: 'var(--text-muted)' }}>Everything you need to make smarter decisions, powered by AI.</p>
          </div>

          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-100px' }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={item}
                className="group rounded-2xl border card-base p-5 shadow-sm transition will-change-transform hover:scale-[1.03] hover:shadow-cyan-500/10"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: 'color-mix(in oklab, var(--accent) 10%, transparent)', boxShadow: 'inset 0 0 0 1px color-mix(in oklab, var(--accent) 30%, transparent)' }}>
                    {f.icon}
                  </div>
                  <h3 className="font-semibold" style={{ color: 'var(--text)' }}>{f.title}</h3>
                </div>
                <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-accent" />
              <span className="font-semibold text-accent">FinAura</span>
            </div>
            <p className="mt-3" style={{ color: 'var(--text-muted)' }}>AI-Powered Smarter Money Management.</p>
          </div>
          <div>
            <h4 className="font-medium" style={{ color: 'var(--text)' }}>Quick Links</h4>
            <ul className="mt-2 space-y-1" style={{ color: 'var(--text-muted)' }}>
              <li><a href="#features" className="hover:opacity-100" style={{ color: 'var(--text)' }}>Features</a></li>
              <li><Link to="/login" className="hover:opacity-100" style={{ color: 'var(--text)' }}>Log In</Link></li>
              <li><Link to="/signup" className="hover:opacity-100" style={{ color: 'var(--text)' }}>Sign Up</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium" style={{ color: 'var(--text)' }}>Contact</h4>
            <ul className="mt-2 space-y-1" style={{ color: 'var(--text-muted)' }}>
              <li>support@finaura.app</li>
              <li className="flex gap-3 pt-1">
                <a className="hover:opacity-100" href="#" aria-label="Twitter" style={{ color: 'var(--text)' }}>Twitter</a>
                <a className="hover:opacity-100" href="#" aria-label="LinkedIn" style={{ color: 'var(--text)' }}>LinkedIn</a>
                <a className="hover:opacity-100" href="#" aria-label="GitHub" style={{ color: 'var(--text)' }}>GitHub</a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}
