import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ComparisonBar } from "@/components/institutions/comparison-bar";
import { SkipLink } from "@/components/accessibility/SkipLink";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "University Discovery Platform",
  description: "Find your perfect university match - tailored for international students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SkipLink />
        <ThemeProvider
          defaultTheme="system"
          storageKey="university-platform-theme"
        >
          <main id="main-content">
            {children}
          </main>
          <ComparisonBar />
        </ThemeProvider>
      </body>
    </html>
  );
}
