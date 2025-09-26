import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | SnapSplit',
  description: 'Privacy Policy for SnapSplit - Social Authentication and Data Protection',
}

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

          <div className="prose prose-gray max-w-none">
            <p className="text-sm text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Information We Collect</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                SnapSplit collects information to provide better services to our users. We collect information in the following ways:
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Social Authentication Data</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you sign in using social authentication providers, we collect:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                <li>Basic profile information (name, email address, profile picture)</li>
                <li>Unique identifier from the authentication provider</li>
                <li>Authentication tokens (stored securely and never shared)</li>
              </ul>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-blue-800 mb-2">Social Authentication Providers:</h4>
                <div className="space-y-3">
                  <div>
                    <strong className="text-blue-700">Google:</strong>
                    <span className="text-gray-700 ml-2">We access your basic profile information, email address, and profile photo through Google's OAuth 2.0 API.</span>
                  </div>
                  <div>
                    <strong className="text-blue-700">Facebook:</strong>
                    <span className="text-gray-700 ml-2">We access your public profile, email address, and profile picture through Facebook's Graph API.</span>
                  </div>
                  <div>
                    <strong className="text-blue-700">Apple:</strong>
                    <span className="text-gray-700 ml-2">We access your name and email address (if you choose to share it) through Apple's Sign in with Apple service.</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                <li>Create and manage your SnapSplit account</li>
                <li>Authenticate your identity and provide secure access</li>
                <li>Personalize your experience within the application</li>
                <li>Communicate with you about your account and our services</li>
                <li>Improve our services and develop new features</li>
                <li>Comply with legal obligations and enforce our terms of service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Data Sharing and Third Parties</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties, except in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations or court orders</li>
                <li>To protect our rights, property, or safety, or that of our users</li>
                <li>In connection with a business transaction (merger, acquisition, etc.)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Third-Party Authentication Services</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you use social authentication, you are also subject to the privacy policies of these providers:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                <li><a href="https://policies.google.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></li>
                <li><a href="https://www.facebook.com/privacy/explanation" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Facebook Privacy Policy</a></li>
                <li><a href="https://www.apple.com/privacy/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Apple Privacy Policy</a></li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Data Security</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement appropriate security measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication tokens and session management</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication for our systems</li>
                <li>Compliance with industry security standards</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this privacy policy.
                Specifically:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                <li>Account information is retained while your account is active</li>
                <li>Authentication tokens are refreshed regularly and expired tokens are deleted</li>
                <li>Profile information is retained until you delete your account</li>
                <li>Some information may be retained for legal compliance purposes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Your Rights and Choices</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
                <li><strong>Portability:</strong> Request export of your data in a portable format</li>
                <li><strong>Revoke Consent:</strong> Disconnect social authentication providers from your account</li>
              </ul>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-yellow-800 mb-2">Managing Social Authentication:</h4>
                <p className="text-gray-700">
                  You can revoke SnapSplit's access to your social media accounts at any time by visiting your account settings
                  on the respective platforms (Google, Facebook, Apple) and removing SnapSplit from your authorized applications.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Cookies and Tracking</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                SnapSplit uses cookies and similar tracking technologies to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                <li>Maintain your login session</li>
                <li>Remember your preferences</li>
                <li>Analyze usage patterns and improve our services</li>
                <li>Provide security features</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-4">
                You can control cookie settings through your browser preferences, but this may affect some functionality of our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. International Data Transfers</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your information may be transferred to and processed in countries other than your own.
                We ensure that such transfers comply with applicable data protection laws and implement
                appropriate safeguards to protect your information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                SnapSplit is not intended for children under 13 years of age. We do not knowingly collect
                personal information from children under 13. If we become aware that we have collected
                personal information from a child under 13, we will take steps to delete such information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may update our Privacy Policy from time to time. We will notify you of any changes by
                posting the new Privacy Policy on this page and updating the "Last updated" date.
                For material changes, we may also send you an email notification.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacy@snapsplit.com<br/>
                  <strong>Subject:</strong> Privacy Policy Inquiry
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}