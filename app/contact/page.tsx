import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us | SnapSplit',
  description: 'Get in touch with the SnapSplit team.',
}

export default function Contact() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #16342c 0%, #1f4a3a 55%, #2d4b42 100%)' }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center gap-2">
          <img src="/snap-split-logo.png" alt="Snap Split" className="w-8 h-8 rounded-lg object-contain" />
          <span className="text-white font-bold text-lg tracking-tight">Snap Split</span>
        </a>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div
          className="w-full max-w-md bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center"
          style={{ border: '1px solid rgba(255,255,255,0.15)' }}
        >
          {/* Icon */}
          <div
            className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(144, 214, 164, 0.2)' }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#90d6a4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>

          <h1 className="text-white font-bold text-2xl mb-3">Get in Touch</h1>
          <p className="text-white/70 text-base mb-8 leading-relaxed">
            Have a question, spotted a bug, or just want to say hi? We&apos;d love to hear from you.
          </p>

          <a
            href="mailto:davidadel95@outlook.com"
            className="inline-flex items-center gap-3 font-semibold text-base px-8 py-4 rounded-full transition-all"
            style={{ background: '#90d6a4', color: '#16342c' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            Send us an email
          </a>

          <p className="text-white/40 text-sm mt-6">
            davidadel95@outlook.com
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-white/30 text-sm">
        © {new Date().getFullYear()} SnapSplit
      </footer>
    </div>
  )
}
