import { Metadata } from 'next';
import Link from 'next/link';
import { CategoryBar } from '@/components/layout/CategoryBar';
import { Mail, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us - India Verified',
  description: 'Get in touch with the India Verified team.',
  openGraph: {
    title: 'Contact Us - India Verified',
    description: 'Have a question, feedback, or press inquiry? We\'d love to hear from you.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us - India Verified',
    description: 'Have a question, feedback, or press inquiry? We\'d love to hear from you.',
  },
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 lg:px-6 pt-24 lg:pt-28 pb-14">
      <div className="mb-10">
        <CategoryBar />
      </div>
      <div className="max-w-3xl">
        <div className="premium-card rounded-3xl p-8 md:p-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-slate-950 tracking-tight">
            Contact Us
          </h1>
          <p className="text-slate-500 text-sm mb-10 leading-relaxed">
            Have a question, feedback, or press inquiry about India Verified?
            We&apos;d love to hear from you.
          </p>

          <div className="space-y-6 text-slate-700 text-sm leading-relaxed">
            <section className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-950 mb-1">Email</h2>
                <a
                  href="mailto:contact@indiaverified.in"
                  className="text-accent hover:text-accent-hover underline"
                >
                  contact@indiaverified.in
                </a>
                <p className="text-slate-400 mt-1">
                  We aim to respond within 24&ndash;48 hours.
                </p>
              </div>
            </section>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-100">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-accent transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
