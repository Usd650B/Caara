import type { Metadata } from "next";
import { Inter, Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const poppins = Poppins({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-poppins" });

export const metadata: Metadata = {
  title: "CARA - Where Every Queen Wears CARA",
  description: "Discover the CARA collection - Premium fashion that defines your universe. Bold, extraordinary, and uniquely you.",
  keywords: ["fashion", "clothing", "CARA", "premium", "style", "elegance", "women's fashion"],
  authors: [{ name: "CARA Fashion" }],
  creator: "CARA Fashion",
  publisher: "CARA Fashion",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://caara-two.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "CARA - Where Every Queen Wears CARA",
    description: "Discover the CARA collection - Premium fashion that defines your universe. Bold, extraordinary, and uniquely you.",
    url: "https://caara-two.vercel.app",
    siteName: "CARA Fashion",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CARA Fashion Collection",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CARA - Where Every Queen Wears CARA",
    description: "Discover the CARA collection - Premium fashion that defines your universe.",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body
        className={`${inter.variable} ${poppins.variable} ${playfair.variable} antialiased min-h-screen flex flex-col font-sans`}
      >
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
