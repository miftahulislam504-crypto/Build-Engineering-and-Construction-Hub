import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import AuthProvider from "@/components/providers/AuthProvider";

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
    default: "Build EngineX — Construction Materials & Engineering Services",
    template: "%s | Build EngineX",
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
  openGraph: {
    type: "website",
    locale: "en_BD",
    siteName: "Build EngineX",
    title: "Build EngineX — Construction Materials & Engineering Services",
    description:
      "Bangladesh-এর সেরা Construction Materials ও Engineering Services Marketplace।",
  },
  twitter: {
    card: "summary_large_image",
    title: "Build EngineX",
    description: "Construction Materials & Engineering Services Marketplace",
  },
  robots: { index: true, follow: true },
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
