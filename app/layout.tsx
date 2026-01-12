import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// ✅ Admin Impersonation Provider
import { ImpersonationProvider } from "@/context/ImpersonationContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Career Guidance System",
  description: "AI powered career guidance with admin dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* 🔐 Admin Impersonation / Role Context */}
        <ImpersonationProvider>
          {children}
        </ImpersonationProvider>
      </body>
    </html>
  );
}
