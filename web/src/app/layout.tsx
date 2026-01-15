import type { Metadata, Viewport } from "next";
import { Inter, Libre_Baskerville } from "next/font/google";
import "./globals.css";
import { BottomNav, FloatingActionButton } from "@/components/navigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-libre",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LLYLI - Learn the Language You Live In",
  description:
    "Your personal language notebook. Capture phrases, hear pronunciation, master vocabulary.",
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
  themeColor: "#0C6B70",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${libreBaskerville.variable}`}>
      <body
        className="font-sans antialiased min-h-screen"
        style={{
          fontFamily: "var(--font-body)",
          backgroundColor: "var(--surface-notebook)",
        }}
      >
        {/* Main content with bottom padding for nav */}
        <main className="min-h-screen pb-20">{children}</main>

        {/* Navigation */}
        <FloatingActionButton />
        <BottomNav />
      </body>
    </html>
  );
}
