/**
 * Authentication Layout
 * 
 * Minimal layout for authentication pages (signup, login, password reset)
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - University Discovery Platform",
  description: "Sign up or log in to discover universities that match your goals.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
