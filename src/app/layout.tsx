import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toast";

const inter = Inter({ 
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Concord — Next-Gen Civic Collaboration",
  description: "AI-powered platform connecting citizens, NGOs, and government to solve social problems through intelligent partnerships.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("RootLayout rendering");
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.className} min-h-screen bg-[#020617] text-slate-50 antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
