import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner'
import CompanyGuard from "@/components/companies/CompanyGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'ERP Cosmos',
  description: 'Sistema multiempresa',
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
        <CompanyGuard>
        {children}
        </CompanyGuard>
        <Toaster
          position="top-right"
          richColors
          closeButton
          expand // ✅ Esto hace que los toast se apilen correctamente
        />
      </body>
    </html>
  );
}
