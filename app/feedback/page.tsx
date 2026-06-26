'use client'

import { useState } from 'react'
import { Metadata } from 'next'

// Note: metadata export doesn't work in Client Components.
// Move to a layout or use a separate server component if SEO is needed.

const RECIPIENT = 'davidadel95@outlook.com'
const SUBJECT = 'SnapSplit - Feedback'

export default function FeedbackPage() {
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = message.trim()
    if (!trimmed) return

    const encodedSubject = encodeURIComponent(SUBJECT)
    const encodedBody = encodeURIComponent(trimmed)
    window.location.href = `mailto:${RECIPIENT}?subject=${encodedSubject}&body=${encodedBody}`
    setSent(true)
  }

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
          className="w-full max-w-md bg-white/10 backdrop-blur-sm rounded-3xl p-8"
          style={{ border: '1px solid rgba(255,255,255,0.15)' }}
        >
          {/* Icon */}
          <div
            className="w-16 h-16 mb-6 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(144, 214, 164, 0.2)' }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#90d6a4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>

          <h1 className="text-white font-bold text-2xl mb-2">Send Feedback</h1>
          <p className="text-white/60 text-sm mb-6 leading-relaxed">
            Tell us what&apos;s working, what isn&apos;t, or anything else on your mind.
          </p>

          {sent ? (
            <div className="text-center py-6">
              <p className="text-white font-semibold text-lg mb-2">Thank you! 🎉</p>
              <p className="text-white/60 text-sm">Your mail client should have opened. We appreciate your feedback.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="My feedback is…"
                rows={6}
                required
                className="w-full rounded-xl p-4 text-sm resize-none outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                }}
              />
              <button
                type="submit"
                disabled={!message.trim()}
                className="font-semibold text-base py-3 rounded-full transition-all disabled:opacity-40"
                style={{ background: '#90d6a4', color: '#16342c' }}
              >
                Send Feedback
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="text-center py-6 text-white/30 text-sm">
        © {new Date().getFullYear()} SnapSplit
      </footer>
    </div>
  )
}
