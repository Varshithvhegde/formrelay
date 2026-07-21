import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/Logo'
import { ArrowRight, Mail, Shield, Zap, Github, Check, Globe, Inbox } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-xl sticky top-0 z-50 bg-background/85">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <Link href="/login" className="hover:text-foreground transition-colors">Sign in</Link>
          </nav>
          <Link href="/signup">
            <Button variant="hero">Get Started <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>
      </header>

      <main>
        {/* ═══ HERO ═══ */}
        <section className="relative pt-20 pb-28 lg:pt-28 lg:pb-36 text-center overflow-hidden">
          {/* Background layers */}
          <div className="absolute inset-0 dot-grid pointer-events-none opacity-60" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,hsl(187_85%_53%/0.12),transparent)] pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />

          <div className="relative max-w-4xl mx-auto px-4 animate-fade-in">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Open source · Free to self-host
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.08] mb-6">
              Contact forms,<br />
              <span className="gradient-text">without the backend.</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Drop one endpoint into your HTML. We receive, store, and email every submission — so you ship the form and move on.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="xl" variant="hero" className="animate-glow-pulse">
                  Start for free <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="https://github.com/Varshithvhegde/formrelay" target="_blank" rel="noopener">
                <Button size="xl" variant="outline" className="border-border/60 hover:border-border">
                  <Github className="h-5 w-5" /> View on GitHub
                </Button>
              </Link>
            </div>

            {/* ── Relay pipeline diagram ── */}
            <div className="mt-20 flex items-center justify-center gap-0">
              {/* Node: Website */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative h-14 w-14 rounded-2xl border border-border/60 bg-card flex items-center justify-center shadow-lg">
                  <Globe className="h-6 w-6 text-muted-foreground" />
                </div>
                <span className="text-xs text-muted-foreground font-medium tracking-wide uppercase">Your site</span>
              </div>

              {/* Connector A */}
              <div className="relative flex items-center mx-1 w-40 -mt-6">
                <div className="h-px w-full bg-gradient-to-r from-border/40 via-primary/40 to-border/40" />
                {/* traveling dot */}
                <span className="absolute left-0 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_8px_hsl(187_85%_53%/0.8)] animate-relay" />
                <span className="absolute text-[10px] font-mono text-muted-foreground/60 -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap">POST /api/submit</span>
              </div>

              {/* Node: FormRelay */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative h-14 w-14 rounded-2xl border border-primary/40 bg-primary/10 flex items-center justify-center shadow-lg shadow-primary/20 animate-glow-pulse">
                  <Zap className="h-6 w-6 text-primary fill-primary/20" />
                </div>
                <span className="text-xs text-primary font-semibold tracking-wide uppercase">FormRelay</span>
              </div>

              {/* Connector B */}
              <div className="relative flex items-center mx-1 w-40 -mt-6">
                <div className="h-px w-full bg-gradient-to-r from-border/40 via-primary/40 to-border/40" />
                <span className="absolute left-0 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_8px_hsl(187_85%_53%/0.8)] animate-relay-delayed" />
                <span className="absolute text-[10px] font-mono text-muted-foreground/60 -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap">email + store</span>
              </div>

              {/* Node: Inbox */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative h-14 w-14 rounded-2xl border border-border/60 bg-card flex items-center justify-center shadow-lg">
                  <Inbox className="h-6 w-6 text-muted-foreground" />
                </div>
                <span className="text-xs text-muted-foreground font-medium tracking-wide uppercase">Your inbox</span>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ SOCIAL PROOF BAR ═══ */}
        <div className="border-y border-border/40 bg-secondary/20 py-5">
          <div className="max-w-5xl mx-auto px-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-muted-foreground">
            {[
              'Zero server setup',
              'Real-time dashboard',
              'Email notifications',
              'Spam protection',
              'Domain allowlists',
            ].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-primary" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* ═══ FEATURES ═══ */}
        <section id="features" className="py-28 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_70%_50%,hsl(187_85%_53%/0.04),transparent)] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-sm uppercase tracking-widest text-primary font-semibold mb-3">Features</p>
              <h2 className="text-4xl font-bold tracking-tight">Everything you need,<br className="hidden sm:block" /> nothing you don't</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Zap,
                  title: 'Instant Setup',
                  desc: 'Create an endpoint in seconds. Paste one URL in your form action or fetch call — that\'s the entire integration.',
                  tag: '< 2 min',
                },
                {
                  icon: Mail,
                  title: 'Email on Submit',
                  desc: 'Get notified the moment someone reaches out. Configure any address per form, toggle off any time.',
                  tag: 'Configurable',
                },
                {
                  icon: Shield,
                  title: 'Built-in Spam Guards',
                  desc: 'Rate limiting, origin domain allowlists, and honeypot support work out of the box before a single submission.',
                  tag: 'Always on',
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="group relative p-7 rounded-2xl border border-border bg-card/40 hover:bg-card/70 hover:border-primary/30 transition-all duration-300 will-gpu overflow-hidden"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,hsl(187_85%_53%/0.06),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <div className="flex items-start justify-between mb-5">
                    <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/15 transition-colors">
                      <f.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-xs font-mono text-primary/70 bg-primary/5 border border-primary/15 px-2 py-0.5 rounded-full">{f.tag}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        <section id="how-it-works" className="py-28 border-t border-border/40 relative">
          <div className="absolute inset-0 grid-lines pointer-events-none opacity-40" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-sm uppercase tracking-widest text-primary font-semibold mb-3">Integration</p>
              <h2 className="text-4xl font-bold tracking-tight">One endpoint. Any stack.</h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* HTML snippet */}
              <div className="relative rounded-2xl border border-border overflow-hidden bg-card/60 backdrop-blur-sm">
                <div className="flex items-center justify-between px-5 py-3 border-b border-border/50 bg-secondary/40">
                  <div className="flex gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-border" />
                    <span className="h-3 w-3 rounded-full bg-border" />
                    <span className="h-3 w-3 rounded-full bg-border" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground/70">contact.html</span>
                  <span className="text-xs bg-secondary/80 text-muted-foreground px-2 py-0.5 rounded border border-border/50">HTML</span>
                </div>
                <pre className="p-5 text-sm font-mono text-foreground/90 overflow-x-auto leading-relaxed">{`<form
  action="https://formrelay.app/api/submit"
  method="POST"
>
  <input type="hidden"
    name="form_id"
    value="<your-form-id>" />

  <input type="text"
    name="name" placeholder="Name" />
  <input type="email"
    name="email" placeholder="Email" />
  <textarea
    name="message"></textarea>

  <button type="submit">Send</button>
</form>`}</pre>
              </div>

              {/* JS snippet */}
              <div className="relative rounded-2xl border border-border overflow-hidden bg-card/60 backdrop-blur-sm">
                <div className="flex items-center justify-between px-5 py-3 border-b border-border/50 bg-secondary/40">
                  <div className="flex gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-border" />
                    <span className="h-3 w-3 rounded-full bg-border" />
                    <span className="h-3 w-3 rounded-full bg-border" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground/70">submit.js</span>
                  <span className="text-xs bg-secondary/80 text-muted-foreground px-2 py-0.5 rounded border border-border/50">JS</span>
                </div>
                <pre className="p-5 text-sm font-mono text-foreground/90 overflow-x-auto leading-relaxed">{`await fetch(
  "https://formrelay.app/api/submit",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      form_id: "<your-form-id>",
      name:    "Jane Doe",
      email:   "jane@example.com",
      message: "Hello!"
    })
  }
)`}</pre>
              </div>
            </div>

            {/* Steps */}
            <div className="mt-16 grid sm:grid-cols-3 gap-6">
              {[
                { step: '01', title: 'Create a form', desc: 'Sign up, hit New Form, and grab your unique form ID from the dashboard.' },
                { step: '02', title: 'Add to your site', desc: 'Drop the form ID into your HTML action or fetch body. No SDK, no config file.' },
                { step: '03', title: 'Watch it arrive', desc: 'Submissions land in your dashboard and email the moment they\'re received.' },
              ].map((s) => (
                <div key={s.step} className="flex gap-4 p-6 rounded-2xl border border-border/50 bg-card/30">
                  <span className="text-3xl font-bold text-primary/20 font-mono shrink-0 leading-none">{s.step}</span>
                  <div>
                    <h3 className="font-semibold mb-1">{s.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section className="py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,hsl(187_85%_53%/0.1),transparent)] pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="relative max-w-2xl mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Ready to ship your form?
            </h2>
            <p className="text-xl text-muted-foreground mb-10">
              Free to use. Open source. No credit card.
            </p>
            <Link href="/signup">
              <Button size="xl" variant="hero" className="animate-glow-pulse">
                Create your first form <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <Logo size="sm" />
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-foreground transition-colors">Sign in</Link>
            <Link href="https://github.com/Varshithvhegde/formrelay" target="_blank" rel="noopener" className="hover:text-foreground transition-colors">GitHub</Link>
          </div>
          <p>© 2025 FormRelay. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
