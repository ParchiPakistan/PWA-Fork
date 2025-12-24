import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import localFont from "next/font/local"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { Toaster } from "@/components/ui/toaster"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

const hagrid = localFont({
  src: [
    {
      path: "./fonts/Hagrid-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Hagrid-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "./fonts/Hagrid-Text-Extrabold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "./fonts/Hagrid-Text-Extrabold-Italic.ttf",
      weight: "800",
      style: "italic",
    },
  ],
  variable: "--font-heading",
})

export const metadata: Metadata = {
  title: "Parchi - Vendor Dashboard",
  description: "Merchant dashboard for managing offers and redemptions",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} ${hagrid.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
