import type { Metadata, Viewport } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import AuthProvider from "@/components/providers/AuthProvider";
import PwaProvider from "@/components/providers/PwaProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  title: {
    default: "EngineX Mart — Construction Materials & Engineering Services",
    template: "%s | EngineX Mart",
  },
  description:
    "Bangladesh-এর সেরা Construction Materials ও Engineering Services Marketplace। Cement, Steel, Paint, Electrical, Sanitary সহ সব ধরনের নির্মাণ সামগ্রী।",
  keywords: [
    "construction materials Bangladesh",
    "cement price Bangladesh",
    "steel rod price BD",
    "Holcim cement",
    "BSRM steel",
    "engineering services BD",
    "building materials online",
    "নির্মাণ সামগ্রী",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EngineX Mart",
  },
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "en_BD",
    siteName: "EngineX Mart",
    title: "EngineX Mart — Construction Materials & Engineering Services",
    description:
      "Bangladesh-এর সেরা Construction Materials ও Engineering Services Marketplace।",
  },
  twitter: {
    card: "summary_large_image",
    title: "EngineX Mart",
    description: "Construction Materials & Engineering Services Marketplace",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#1e3a8a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${syne.variable}`}>
      <body className="font-sans bg-white text-dark-900 antialiased">
        <AuthProvider>
          <PwaProvider />
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#1e293b",
                color: "#f8fafc",
                borderRadius: "12px",
                fontSize: "14px",
              },
              success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
              error:   { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
