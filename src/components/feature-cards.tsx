'use client';

import { motion } from 'framer-motion';
import {
  FileSearch,
  Type,
  ShieldAlert,
  GitCompareArrows,
  FileCode2,
  FileText,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

const features: Feature[] = [
  {
    icon: FileSearch,
    title: 'Smart Scanning',
    description: 'Scans source files across 6 languages to find every process.env, os.getenv, and env::var usage.',
    color: 'text-emerald-500',
  },
  {
    icon: Type,
    title: 'Type Inference',
    description: 'Automatically infers types (string, number, boolean, url, json) from names, defaults, and usage patterns.',
    color: 'text-teal-500',
  },
  {
    icon: ShieldAlert,
    title: 'Secret Detection',
    description: 'Flags variables matching secret naming patterns and known API key formats (AWS, Stripe, GitHub, JWT).',
    color: 'text-rose-500',
  },
  {
    icon: GitCompareArrows,
    title: 'Drift Detection',
    description: 'Compares .env.example against actual code usage to find missing or unused variables.',
    color: 'text-amber-500',
  },
  {
    icon: FileCode2,
    title: 'Typed Accessor Generation',
    description: 'Generates a TypeScript env.ts file with Zod schemas and typed accessors — copy, paste, ship.',
    color: 'text-cyan-500',
  },
  {
    icon: FileText,
    title: 'Documentation Generator',
    description: 'Produces clean Markdown documentation with summary tables, details, and stats. Auto-updates on every scan.',
    color: 'text-violet-500',
  },
];

export function FeatureCards() {
  return (
    <section className="container py-20">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Everything you need to manage env vars
        </h2>
        <p className="mt-4 text-muted-foreground">
          From scanning to documentation, EnvDoctor handles the full lifecycle of environment variable management.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="group relative overflow-hidden border-border/40 transition-all hover:border-border hover:shadow-lg">
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-10" />
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
