import type { Metadata } from "next";
import { Quicksand, Spectral, Josefin_Sans, Azeret_Mono } from "next/font/google";
import "./globals.css";
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import { getUserRole } from '@/lib/supabase/role'
import ChaosProvider from '@/components/providers/ChaosProvider'
import ThemeProvider from '@/components/providers/ThemeProvider'
import RoleSyncListener from '@/components/features/RoleSyncListener'
import Footer from '@/components/layout/Footer'

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
});

const spectral = Spectral({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-spectral",
});

const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  variable: "--font-josefin-sans",
});

const azeretMono = Azeret_Mono({
  subsets: ["latin"],
  variable: "--font-azeret-mono",
});

export const metadata: Metadata = {
  title: {
    default: "NUSCAS | University Anime Club",
    template: "%s | NUSCAS"
  },
  description: "The official website and member portal of NUSCAS.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://to-the-moon-gold.vercel.app"),
  openGraph: {
    title: "NUSCAS | University Anime Club",
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
    title: "NUSCAS | University Anime Club",
    description: "The official website and member portal of NUSCAS.",
    images: ["/og-image.png"],
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const role = await getUserRole(supabase)
  const showAdminLink = !!(user && (role === 'committee' || role === 'admin'))

  return (
    <html lang="en" className={`h-full ${quicksand.variable} ${spectral.variable} ${josefinSans.variable} ${azeretMono.variable}`}>
      <body
        className="antialiased min-h-full flex flex-col bg-background text-foreground transition-colors duration-300 overflow-x-hidden"
      >
        <ThemeProvider>
          <ChaosProvider>
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
            <main id="main-content" className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-8 outline-none">
              {children}
            </main>

            {/* Interactive Footer */}
            <Footer />
          </ChaosProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
