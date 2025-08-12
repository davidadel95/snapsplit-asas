"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"

function ShareContent() {
  const searchParams = useSearchParams()
  const data = searchParams.get("data")

  const handleDownload = () => {
    window.open("https://apps.apple.com/eg/app/snap-split-bill-splitter/id6749791093", "_blank")
  }

  return (
    <div className="min-h-screen bg-[#2D4B42] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {/* App Icon/Logo */}
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto rounded-lg">
            <img src="/snap-split-logo.png" alt="Snap Split Logo" className="w-full h-full object-contain rounded-lg" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Snap Split</h1>

        {/* Subtitle */}
        <p className="text-gray-600 mb-6">
          Someone shared a bill with you! Download the app to view and split expenses easily.
        </p>

        {/* Data indicator (if data exists) */}
        {data && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-blue-700">📄 Shared bill data received</p>
          </div>
        )}

        {/* Download Button - Official App Store Badge */}
        <button
          onClick={handleDownload}
          className="mx-auto block hover:opacity-80 transition-opacity duration-200"
          aria-label="Download Snap Split on the App Store"
        >
          <img src="/app-store-badge.webp" alt="Download on the App Store" className="h-14 w-auto" />
        </button>

        {/* Alternative text */}
        <p className="text-sm text-gray-500 mt-4">Available for iPhone and iPad</p>

        {/* Features */}
        <div className="mt-8 space-y-3">
          <div className="flex items-center gap-3 text-left">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm">✓</span>
            </div>
            <span className="text-gray-700 text-sm">Split bills with friends easily</span>
          </div>
          <div className="flex items-center gap-3 text-left">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm">✓</span>
            </div>
            <span className="text-gray-700 text-sm">Track expenses and payments</span>
          </div>
          <div className="flex items-center gap-3 text-left">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm">✓</span>
            </div>
            <span className="text-gray-700 text-sm">Share bills instantly</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SharePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#2D4B42] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <ShareContent />
    </Suspense>
  )
}
