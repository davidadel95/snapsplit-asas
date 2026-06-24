export default function Home() {
  const APP_STORE_URL =
    "https://apps.apple.com/eg/app/snap-split-bill-splitter/id6749791093";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(160deg, #16342c 0%, #1f4a3a 55%, #2d4b42 100%)" }}
    >
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <img
            src="/snap-split-logo.png"
            alt="Snap Split"
            className="w-8 h-8 rounded-lg object-contain"
          />
          <span className="text-white font-bold text-lg tracking-tight">Snap Split</span>
        </div>
        <a
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-white/90 border border-white/30 rounded-full px-4 py-1.5 hover:bg-white/10 transition-colors"
        >
          Open App
        </a>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="mb-8">
          <div
            className="w-24 h-24 mx-auto rounded-[22px] shadow-2xl overflow-hidden mb-6"
            style={{ boxShadow: "0 16px 40px rgba(0,0,0,0.35)" }}
          >
            <img
              src="/snap-split-logo.png"
              alt="Snap Split App Icon"
              className="w-full h-full object-cover"
            />
          </div>
          <h1
            className="text-white font-bold mb-3"
            style={{ fontSize: "36px", lineHeight: "44px", letterSpacing: "-0.02em" }}
          >
            Split any bill,
            <br />
            <span style={{ color: "#90d6a4" }}>instantly.</span>
          </h1>
          <p className="text-white/70 text-lg max-w-xs mx-auto" style={{ lineHeight: "1.6" }}>
            Scan a receipt, invite your group, and everyone knows what they owe — no spreadsheets, no awkward maths.
          </p>
        </div>

        {/* Feature cards */}
        <div className="w-full max-w-sm space-y-3 mb-10">
          {[
            { icon: "📸", title: "Scan any receipt", desc: "AI reads totals instantly" },
            { icon: "👥", title: "Invite your group", desc: "Share a live link, join from any device" },
            { icon: "✅", title: "Pay your exact share", desc: "Fair splits, down to the cent" },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="flex items-center gap-4 rounded-2xl px-5 py-4 text-left"
              style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
            >
              <span className="text-2xl flex-shrink-0">{icon}</span>
              <div>
                <p className="text-white font-semibold text-sm">{title}</p>
                <p className="text-white/60 text-sm">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* App Store CTA */}
        <a
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-white text-[#16342c] font-bold rounded-full px-8 py-4 text-base shadow-lg hover:bg-white/90 active:scale-95 transition-all mb-4"
          style={{ fontSize: "16px" }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
          </svg>
          Download on the App Store
        </a>

        <img
          src="/app-store-badge.webp"
          alt="Download on the App Store"
          className="h-10 w-auto opacity-60"
        />
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 text-center">
        <div className="flex justify-center gap-6 mb-2 text-sm text-white/50">
          <a href="/privacy" className="hover:text-white/80 transition-colors">Privacy</a>
          <a href="/terms" className="hover:text-white/80 transition-colors">Terms</a>
          <a href="/data-deletion" className="hover:text-white/80 transition-colors">Data Deletion</a>
        </div>
        <p className="text-white/30 text-xs">© {new Date().getFullYear()} Snap Split. All rights reserved.</p>
      </footer>
    </div>
  );
}

