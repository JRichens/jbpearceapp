import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { siteConfig } from '@/config/site'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

const APP_NAME = 'JBP App'
const APP_DEFAULT_TITLE = 'JBP App'
const APP_TITLE_TEMPLATE = '%s - PWA App'
const APP_DESCRIPTION = 'All things J B Pearce'

export const metadata: Metadata = {
    metadataBase: new URL('https://jbpearce.co.uk'),
    applicationName: APP_NAME,
    title: {
        default: APP_DEFAULT_TITLE,
        template: `%s | ${APP_DEFAULT_TITLE}`,
    },
    description: APP_DESCRIPTION,
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: APP_DEFAULT_TITLE,
        // startUpImage: [],
    },
    formatDetection: {
        telephone: false,
    },
    openGraph: {
        type: 'website',
        siteName: APP_NAME,
        title: {
            default: APP_DEFAULT_TITLE,
            template: APP_TITLE_TEMPLATE,
        },
        description: APP_DESCRIPTION,
    },
    twitter: {
        card: 'summary',
        title: {
            default: APP_DEFAULT_TITLE,
            template: APP_TITLE_TEMPLATE,
        },
        description: APP_DESCRIPTION,
    },
}

export const viewport: Viewport = {
    themeColor: '#FFFFFF',
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
                    formButtonPrimary: 'bg-gold hover:bg-darkgold text-base',
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
