import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import "./globals.css";
import { createClient } from '@/lib/supabase/server'
import AuthButton from '@/components/features/AuthButton'
import { getUserRole } from '@/lib/supabase/role'
import ChaosProvider from '@/components/providers/ChaosProvider'
import Footer from '@/components/layout/Footer'

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full flex flex-col bg-background text-foreground transition-colors duration-300`}
      >
        <ChaosProvider>
          {/* Header/Navbar */}
          <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur transition-colors duration-300">
            <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-6">
                <Link href="/" className="font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">
                  NUSCAS
                </Link>
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-text-muted">
                  <Link href="/blog" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Blog</Link>
                  <Link href="/events" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Events</Link>
                  <Link href="/gallery" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Gallery</Link>
                  <Link href="/ratings" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Ratings</Link>
                  <Link href="/vn" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Visual Novels</Link>
                </nav>
              </div>
              <div className="flex items-center gap-4">
                {user && (
                  <Link
                    href="/member/ratings"
                    className="text-sm font-medium text-text-muted hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    Member Area
                  </Link>
                )}
                {showAdminLink && (
                  <Link
                    href="/admin/dashboard"
                    className="text-sm font-medium text-text-muted hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    Admin Area
                  </Link>
                )}
                <AuthButton user={user} />
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>

          {/* Interactive Footer */}
          <Footer />
        </ChaosProvider>
      </body>
    </html>
  );
}
