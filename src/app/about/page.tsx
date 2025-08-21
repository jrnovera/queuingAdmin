'use client';

import { useRouter } from 'next/navigation';

export default function AboutPage() {
  const router = useRouter();
  const goHome = () => router.replace('/home');

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <button
            type="button"
            onClick={goHome}
            className="w-7 h-7 bg-black text-white flex items-center justify-center"
            aria-label="Back"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold tracking-wide">ABOUT US</h1>
        </div>

        {/* Card */}
        <div className="border-2 border-black rounded-2xl p-6 sm:p-8">
          <div className="flex items-start gap-6">
            {/* Info Icon */}
            <div className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-black flex items-center justify-center">
              <svg className="w-12 h-12 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" fill="white" />
                <path d="M12 10v6" />
                <circle cx="12" cy="7" r="1" fill="currentColor" stroke="currentColor" />
              </svg>
            </div>

            {/* Text */}
            <div className="flex-1 text-gray-900">
              <p className="mb-3">
                This app streamlines queue management with fast, scannable QR codes. It helps
                offices organize, track, and serve people efficiently.
              </p>
              <p className="mb-3">
                Built with a focus on simplicity and speed, it provides tools for creating
                queues, monitoring progress, and exporting reports.
              </p>
              <p>
                For feedback or collaboration, reach out via the Settings &gt; About Us page or
                contact the project maintainers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
