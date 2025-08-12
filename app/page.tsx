"use client"

export default function Home() {
  const handleDownload = () => {
    window.open("https://apps.apple.com/eg/app/snap-split-bill-splitter/id6749791093", "_blank")
  }

  return (
    <div className="min-h-screen bg-[#2D4B42] flex items-center justify-center p-4">
      <div className="text-center">
        {/* App Logo */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto rounded-lg">
            <img src="/snap-split-logo.png" alt="Snap Split Logo" className="w-full h-full object-contain rounded-lg" />
          </div>
        </div>

        {/* App Title */}
        <h1 className="text-4xl font-bold text-white mb-4">Snap Split</h1>

        {/* App Description */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-6 max-w-md mx-auto mb-8">
          <p className="text-white/90 text-lg">
            Split bills with friends easily. Track expenses and share bills instantly.
          </p>
        </div>

        {/* Download Button - Official App Store Badge */}
        <button
          onClick={handleDownload}
          className="mx-auto block hover:opacity-80 transition-opacity duration-200"
          aria-label="Download Snap Split on the App Store"
        >
          <img src="/app-store-badge.webp" alt="Download on the App Store" className="h-14 w-auto" />
        </button>

        {/* Alternative text */}
        <p className="text-white/70 text-sm mt-4">Available for iPhone and iPad</p>

        {/* Optional: Add some visual elements */}
        <div className="mt-12 flex justify-center space-x-4">
          <div className="w-3 h-3 bg-white/30 rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-3 h-3 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
        </div>
      </div>
    </div>
  )
}
