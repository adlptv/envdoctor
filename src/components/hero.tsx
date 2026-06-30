'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, FileSearch, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Glassmorphism background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="absolute top-40 left-1/3 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="container relative py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-4 py-1.5 text-sm backdrop-blur-md">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span className="text-muted-foreground">Audit · Detect · Generate</span>
          </div>

          <h1 className="bg-gradient-to-br from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent md:text-6xl lg:text-7xl">
            Your Environment Variables,
            <br />
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              Audited & Documented
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            EnvDoctor scans your codebase for environment variable usage, infers types, detects secrets,
            checks for drift, and generates typed accessors + documentation automatically.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="h-12 px-8 text-base">
              <Link href="/projects/new">
                Start Auditing <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base">
              <Link href="/dashboard">View Dashboard</Link>
            </Button>
          </div>

          {/* Mini stats */}
          <div className="mt-16 grid grid-cols-3 gap-8">
            {[
              { icon: FileSearch, label: 'Files Scanned', value: '∞' },
              { icon: Code2, label: 'Languages', value: '6' },
              { icon: ShieldCheck, label: 'Secret Patterns', value: '10+' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex flex-col items-center gap-2"
              >
                <stat.icon className="h-6 w-6 text-emerald-500" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
