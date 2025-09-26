import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms and Conditions | SnapSplit',
  description: 'Terms and Conditions for SnapSplit',
}

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms and Conditions</h1>

          <div className="prose prose-gray max-w-none">
            <p className="text-sm text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By accessing and using SnapSplit, you accept and agree to be bound by the terms and provision of this agreement.
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Use License</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Permission is granted to temporarily download one copy of SnapSplit per device for personal, non-commercial transitory viewing only.
                This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display</li>
                <li>attempt to reverse engineer any software contained on the website</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Disclaimer</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The materials on SnapSplit are provided on an 'as is' basis. SnapSplit makes no warranties,
                expressed or implied, and hereby disclaim and negate all other warranties including without limitation,
                implied warranties or conditions of merchantability, fitness for a particular purpose,
                or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Limitations</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                In no event shall SnapSplit or its suppliers be liable for any damages (including, without limitation,
                damages for loss of data or profit, or due to business interruption) arising out of the use or
                inability to use the materials on SnapSplit, even if SnapSplit or a SnapSplit authorized
                representative has been notified orally or in writing of the possibility of such damage.
                Because some jurisdictions do not allow limitations on implied warranties, or limitations of
                liability for consequential or incidental damages, these limitations may not apply to you.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect
                your information when you use our service. By using SnapSplit, you agree to the collection
                and use of information in accordance with our Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. User Content</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You retain ownership of any content you upload to SnapSplit. However, by uploading content,
                you grant us a non-exclusive, worldwide, royalty-free license to use, store, and process
                your content solely for the purpose of providing the service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Prohibited Uses</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may not use SnapSplit:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                <li>For any unlawful purpose or to solicit others to unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Termination</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may terminate or suspend your access immediately, without prior notice or liability,
                for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
                If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about these Terms and Conditions, please contact us.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}