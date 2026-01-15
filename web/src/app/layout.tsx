import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav, FloatingActionButton } from "@/components/navigation";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LLYLI - Learn the Language You Live In",
  description:
    "Turn real-life language encounters into memorable learning experiences with smart cards and spaced repetition.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LLYLI",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0A696D",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* Main content with bottom padding for nav */}
        <main className="min-h-screen pb-20">{children}</main>

        {/* Navigation */}
        <FloatingActionButton />
        <BottomNav />
      </body>
    </html>
  );
}
