import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { siteConfig } from "@/config/site"
import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: [
    {
      url: "/LOGO32x32.jpg",
      href: "/LOGO32x32.jpg",
      type: "image/jpg",
      sizes: "32x32",
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary: "bg-gold hover:bg-darkgold text-base",
        },
      }}
    >
      <html lang="en">
        <body className={inter.className}>
          {children}

          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
