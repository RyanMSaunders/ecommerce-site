import type { Metadata } from "next";
// import localFont from "next/font/local";
import '@/app/globals.css'
import { Inter } from "next/font/google"
import { cn } from "@/lib/utils";


const inter = Inter({subsets: ["latin"], variable: "--font-sans"});

export const metadata: Metadata = {
  title: "Chord Café",
  description: "Learn music online at your own pace with interactive video lessons!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn("bg-background min-h-screen font-sans anialiased", inter.variable)}
      >
        {children}
      </body>
    </html>
  );
}
