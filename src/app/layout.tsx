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
import JsonLd from '@/components/JsonLd'
import { getSiteTheme } from '@/lib/siteTheme'
import {
  SITE_URL,
  SITE_NAME,
  ORG_ID,
  ORG_LEGAL_NAME,
  ORG_DESCRIPTION,
  ORG_EMAIL,
  ORG_LOGO,
  ORG_SOCIALS,
  DEFAULT_OG_IMAGE,
} from '@/lib/site'

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
    default: `${ORG_LEGAL_NAME} (NUSCAS)`,
    template: "%s | NUSCAS"
  },
  description: ORG_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  keywords: [
    "NUSCAS",
    "NUS Comics and Animation Society",
    "NUS anime club",
    "NUS anime society",
    "anime club Singapore",
    "NUS cosplay",
    "NUS manga",
    "NUS CCA",
    "CASuals",
    "TOPICS",
    "Palette",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: `${ORG_LEGAL_NAME} (NUSCAS)`,
    description: ORG_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NUSCAS Portal"
      }
    ],
    locale: "en_SG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${ORG_LEGAL_NAME} (NUSCAS)`,
    description: ORG_DESCRIPTION,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/images/nuscas-favicon.webp"
  },
};

// Identity graph for the whole site. Every Event's organizer points at ORG_ID,
// so search engines resolve them all to this one entity.
const siteJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    legalName: ORG_LEGAL_NAME,
    alternateName: ["NUS Comics and Animation Society", "NUS CAS", "NUSCAS"],
    url: SITE_URL,
    logo: ORG_LOGO,
    image: DEFAULT_OG_IMAGE,
    description: ORG_DESCRIPTION,
    email: ORG_EMAIL,
    foundingDate: "1999",
    sameAs: ORG_SOCIALS,
    parentOrganization: {
      "@type": "CollegeOrUniversity",
      name: "National University of Singapore",
      url: "https://www.nus.edu.sg/",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Singapore",
      addressCountry: "SG",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: ORG_DESCRIPTION,
    publisher: { "@id": ORG_ID },
    inLanguage: "en-SG",
  },
];

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [{ user, role }, siteTheme] = await Promise.all([getAuthUserAndRole(), getSiteTheme()])
  const showAdminLink = !!(user && (role === 'committee' || role === 'admin'))

  return (
    <html lang="en" className={`h-full ${siteTheme !== 'default' ? `theme-${siteTheme} ` : ''}${quicksand.variable} ${birthstone.variable} ${cormorantGaramond.variable} ${azeretMono.variable}`}>
      <body
        className="antialiased min-h-full flex flex-col bg-background text-foreground transition-colors duration-300 overflow-x-hidden"
      >
        <JsonLd data={siteJsonLd} />
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
          <Header user={user} showAdminLink={showAdminLink} isHalloween={siteTheme === 'halloween'} />

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
