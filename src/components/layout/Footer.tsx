'use client'

import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-surface mt-auto transition-colors duration-300">
      <div className="max-w-7xl mx-auto pt-8 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-text-muted">
        
        {/* Left Side: Copyright */}
        <div className="flex items-center gap-1">
          <span>&copy; {currentYear} NUS Comics and Animation Society. All rights reserved.</span>
        </div>

        {/* Right Side: Navigation Links */}
        <div className="flex items-center gap-4">
          <Link
            href="/privacy"
            className="hover:text-accent transition-colors underline-offset-4 hover:underline"
          >
            Privacy Policy
          </Link>
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=nuscomicssoc@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors underline-offset-4 hover:underline"
          >
            Contact Us
          </a>
        </div>
      </div>

        {/* Disclaimer & Declarations */}
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-xs leading-relaxed text-text-muted">
          <p className="font-semibold text-text">Disclaimer and Declarations</p>
          <p>
            This Society is registered with the Registry of Societies of Singapore.
            It is formed by students of the National University of Singapore and is self-governing.
            It is not part of the legal entity of the National University of Singapore. It does not
            represent the National University of Singapore and cannot act or make any representations
            on its behalf. The activities and views of this University Society are the sole
            responsibility of the Society and its members.
          </p>
      </div>
    </footer>
  )
}
