import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Data Deletion Request | SnapSplit',
  description: 'Request deletion of your data from SnapSplit',
}

export default function DataDeletion() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Data Deletion Request</h1>

          <div className="prose prose-gray max-w-none">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 font-semibold mb-2">Facebook Login Data Deletion</p>
              <p className="text-gray-700">
                If you logged into SnapSplit using Facebook and want to delete your data,
                you can follow the instructions below or contact us directly.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">How to Delete Your Data</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You have several options to request deletion of your data from SnapSplit:
              </p>

              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Option 1: Delete Your Account (Recommended)</h3>
                  <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
                    <li>Log into your SnapSplit account</li>
                    <li>Go to your Account Settings</li>
                    <li>Click on "Delete Account"</li>
                    <li>Confirm the deletion request</li>
                    <li>Your account and all associated data will be permanently deleted within 30 days</li>
                  </ol>
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-green-800 text-sm">
                      ✓ This method immediately removes all your data including photos, profile information, and authentication records.
                    </p>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Option 2: Email Request</h3>
                  <p className="text-gray-700 mb-3">Send an email to our data protection team with the following information:</p>
                  <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-3">
                    <p className="font-semibold">Email Template:</p>
                    <div className="mt-2 text-sm text-gray-600">
                      <p><strong>To:</strong> privacy@snapsplit.com</p>
                      <p><strong>Subject:</strong> Data Deletion Request - Facebook Login</p>
                      <p><strong>Message:</strong></p>
                      <div className="mt-1 pl-4 border-l-2 border-gray-300">
                        <p>I request the deletion of all my personal data associated with my SnapSplit account.</p>
                        <p>Facebook User ID: [Your Facebook User ID if known]</p>
                        <p>Email associated with account: [Your email address]</p>
                        <p>Account creation date (if known): [Date]</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">
                    We will process your request within 30 days and send you a confirmation email once completed.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Option 3: Revoke Facebook Access</h3>
                  <p className="text-gray-700 mb-3">You can also revoke SnapSplit's access to your Facebook data:</p>
                  <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
                    <li>Go to your <a href="https://www.facebook.com/settings?tab=applications" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Facebook App Settings</a></li>
                    <li>Find "SnapSplit" in your list of connected apps</li>
                    <li>Click "Remove" to revoke access</li>
                    <li>This will disconnect your Facebook account from SnapSplit</li>
                  </ol>
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-yellow-800 text-sm">
                      ⚠️ Note: This only revokes future access. To delete data already collected, you'll need to use Option 1 or 2.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">What Data Gets Deleted</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you request data deletion, we will remove:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                <li>Your profile information (name, email, profile picture)</li>
                <li>All photos and media you've uploaded</li>
                <li>Authentication tokens and login credentials</li>
                <li>Account preferences and settings</li>
                <li>Usage data and analytics associated with your account</li>
                <li>Any backups containing your personal information</li>
              </ul>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-red-800 mb-2">Important:</h4>
                <p className="text-gray-700">
                  Data deletion is permanent and cannot be undone. Make sure to download any photos or
                  data you want to keep before proceeding with the deletion request.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Data Retention Exceptions</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                In some cases, we may retain certain information for legal or business purposes:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                <li>Information required for legal compliance or ongoing legal proceedings</li>
                <li>Anonymized usage statistics that cannot be linked back to you</li>
                <li>Records of the deletion request itself for audit purposes</li>
                <li>Information needed to prevent fraud or abuse</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Processing Timeline</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <ul className="space-y-2 text-gray-700">
                  <li><strong>Immediate:</strong> Account access is disabled</li>
                  <li><strong>Within 48 hours:</strong> Data removal begins</li>
                  <li><strong>Within 7 days:</strong> Most data is deleted from active systems</li>
                  <li><strong>Within 30 days:</strong> All data including backups are permanently deleted</li>
                  <li><strong>Confirmation:</strong> You'll receive an email when the process is complete</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Need Help?</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have questions about the data deletion process or need assistance, please contact us:
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacy@snapsplit.com<br/>
                  <strong>Subject:</strong> Data Deletion Support<br/>
                  <strong>Response Time:</strong> We typically respond within 24-48 hours
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Facebook Data Deletion Callback</h2>
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                <p className="text-gray-600 text-sm mb-2">For developers and Facebook compliance:</p>
                <p className="text-gray-700">
                  This page serves as SnapSplit's data deletion instructions URL as required by Facebook's Platform Policy.
                  Users who have connected their Facebook account to SnapSplit can follow the instructions above to request
                  deletion of their data.
                </p>
                <p className="text-gray-600 text-xs mt-2">
                  Data Deletion Callback URL: {typeof window !== 'undefined' ? window.location.href : 'https://snapsplit.com/data-deletion'}
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}