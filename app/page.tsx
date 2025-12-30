import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/Logo'
import { ArrowRight, Mail, Shield, Zap, Github } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-xl sticky top-0 z-50 bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <Logo />
          <Link href="/signup">
            <Button variant="hero">Get Started <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="relative py-24 lg:py-32 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(187_85%_53%/0.1),transparent_70%)] pointer-events-none" />
          <div className="relative space-y-6 max-w-3xl mx-auto px-4 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Contact Forms <span className="gradient-text">Without the Backend</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Add working contact forms to any website in minutes. No servers, no databases, no hassle. Just submit to our API and we handle the rest.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/signup">
                <Button size="xl" variant="hero">Start Free <ArrowRight className="h-5 w-5" /></Button>
              </Link>
              <Link href="https://github.com/Varshithvhegde/formrelay" target="_blank">
                <Button size="xl" variant="outline"><Github className="h-5 w-5 mr-2" /> GitHub</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 border-t border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Zap, title: 'Instant Setup', desc: 'Create a form endpoint in seconds. Get an API URL and start collecting submissions immediately.' },
                { icon: Mail, title: 'Email Notifications', desc: 'Receive instant email alerts for every submission. Never miss a lead again.' },
                { icon: Shield, title: 'Spam Protection', desc: 'Built-in rate limiting, domain allowlists, and honeypot support to keep spam out.' },
              ].map((f, i) => (
                <div key={i} className="p-6 rounded-xl border border-border bg-card/50 hover:border-primary/50 transition-all group">
                  <f.icon className="h-10 w-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                  <p className="text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Code Example */}
        <section className="py-24 border-t border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <h2 className="text-3xl font-bold">Simple Integration</h2>
              <div className="text-left p-6 rounded-xl bg-secondary/30 border border-border font-mono text-sm overflow-x-auto">
                <pre className="text-foreground/90">{`fetch("https://formrelay.app/api/submit", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    form_id: "your-form-id",
    name: "Jane Doe",
    email: "jane@example.com",
    message: "Hello from my website!"
  })
})`}</pre>
              </div>
              <Link href="/signup">
                <Button variant="hero" size="lg">Create Your Form <ArrowRight className="h-4 w-4" /></Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-sm text-muted-foreground">
          <Logo size="sm" />
          <p>© 2025 FormRelay. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
