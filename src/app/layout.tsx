import { Suspense } from 'react'
import type { Metadata } from "next";
import { Manrope, Birthstone, Cormorant_Garamond, Azeret_Mono } from "next/font/google";
import "./globals.css";
import Header from '@/components/layout/Header'
import { getAuthUserAndRole } from '@/lib/supabase/auth'
import ThemeProvider from '@/components/providers/ThemeProvider'
import RoleSyncListener from '@/components/features/auth/RoleSyncListener'
import Footer from '@/components/layout/Footer'
import EventDetailModal from '@/components/features/events/EventDetailModal'

const quicksand = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant-garamond",
});

const birthstone = Birthstone({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-birthstone",
});

const azeretMono = Azeret_Mono({
  subsets: ["latin"],
  variable: "--font-azeret-mono",
});

export const metadata: Metadata = {
  title: {
    default: "NUSCAS",
    template: "%s | NUSCAS"
  },
  description: "The official website and member portal of NUSCAS.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.nuscas.com"),
  openGraph: {
    title: "NUSCAS",
    description: "The official website and member portal of NUSCAS.",
    url: "/",
    siteName: "NUSCAS",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NUSCAS Portal"
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NUSCAS",
    description: "The official website and member portal of NUSCAS.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/images/nuscas-favicon.webp"
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, role } = await getAuthUserAndRole()
  const showAdminLink = !!(user && (role === 'committee' || role === 'admin'))

  return (
    <html lang="en" className={`h-full ${quicksand.variable} ${birthstone.variable} ${cormorantGaramond.variable} ${azeretMono.variable}`}>
      <body
        className="antialiased min-h-full flex flex-col bg-background text-foreground transition-colors duration-300 overflow-x-hidden"
      >
        <ThemeProvider>
          <RoleSyncListener user={user} currentRole={role} />
          {/* Skip to content link for a11y */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] bg-accent text-accent-foreground px-4 py-2 rounded-md shadow-lg font-medium outline-none ring-2 ring-accent transition-all"
          >
            Skip to content
          </a>

          {/* Header/Navbar (Sidebar Navigation) */}
          <Header user={user} showAdminLink={showAdminLink} />

          {/* Main Content Area */}
          <main id="main-content" className="flex-grow max-w-[90rem] mx-auto w-full px-4 sm:px-6 lg:px-8 pb-8 outline-none">
            {children}
          </main>

          {/* Event Lightbox Details Modal */}
          <Suspense fallback={null}>
            <EventDetailModal />
          </Suspense>

          {/* Interactive Footer */}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
