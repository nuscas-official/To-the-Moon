import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import "./globals.css";
import { createClient } from '@/lib/supabase/server'
import AuthButton from '@/components/features/AuthButton'
import { getUserRole } from '@/lib/supabase/role'

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "NUSCAS | University Anime Club",
  description: "The official website and member portal of NUSCAS.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const role = await getUserRole(supabase)
  const showAdminLink = user && (role === 'committee' || role === 'admin')

  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full flex flex-col bg-slate-50 text-slate-900`}
      >
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-6">
              <Link href="/" className="font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">
                NUSCAS
              </Link>
              <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                <Link href="/blog" className="hover:text-slate-900 transition-colors">Blog</Link>
                <Link href="/events" className="hover:text-slate-900 transition-colors">Events</Link>
                <Link href="/gallery" className="hover:text-slate-900 transition-colors">Gallery</Link>
                <Link href="/ratings" className="hover:text-slate-900 transition-colors">Ratings</Link>
                <Link href="/vn" className="hover:text-slate-900 transition-colors">Visual Novels</Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <Link
                  href="/member/test"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Member Area
                </Link>
              )}
              {showAdminLink && (
                <Link
                  href="/admin/test"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Admin Area
                </Link>
              )}
              <AuthButton user={user} />
            </div>
          </div>
        </header>

        <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <footer className="border-t border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <div>
              &copy; {new Date().getFullYear()} NUSCAS. All rights reserved.
            </div>
            <div className="flex gap-6">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">
                GitHub
              </a>
              <Link href="/about" className="hover:text-slate-900 transition-colors">
                About Us
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
