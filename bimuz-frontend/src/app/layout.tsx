import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "BIMUZ — Zamonaviy o'quv platformasi",
  description: "O'quv markazi uchun soddalashtirilgan o'quv tizimi",
};

import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body className={`${inter.variable} antialiased`}>
        <Toaster position="top-right" />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
