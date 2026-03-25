import type { Metadata } from "next";
import { Inter, Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const poppins = Poppins({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-poppins" });

export const metadata: Metadata = {
  title: "SheDoo - Premium Luxury Handbags",
  description: "Discover SheDoo Elegance - High-quality, stylish luxury handbags at prices you can afford. Premium fashion for every style.",
  keywords: ["handbags", "luxury bags", "SheDoo", "fashion", "designer bags", "premium handbags"],
  authors: [{ name: "SheDoo Fashion" }],
  creator: "SheDoo Fashion",
  publisher: "SheDoo Beauty",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://shedoo.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SheDoo - Premium Luxury Handbags",
    description: "Discover SheDoo Elegance - High-quality, stylish luxury handbags at prices you can afford.",
    url: "https://shedoo.com",
    siteName: "SheDoo Fashion",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SheDoo Fashion Collection",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SheDoo - Premium Luxury Handbags",
    description: "Discover SheDoo Elegance - High-quality, stylish luxury handbags at prices you can afford.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

import { SettingsProvider } from "@/lib/settings";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
      </head>
      <body
        className={`${inter.variable} ${poppins.variable} ${playfair.variable} antialiased min-h-screen flex flex-col font-sans`}
      >
        <SettingsProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </SettingsProvider>
      </body>
    </html>
  );
}
