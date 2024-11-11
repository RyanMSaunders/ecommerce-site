import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Inter } from "next/font/google"
import { cn } from "@/lib/utils";


// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

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
        // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        className={cn("bg-background min-h-screen font-sans anialiased", inter.variable)}
      >
        {children}
      </body>
    </html>
  );
}
