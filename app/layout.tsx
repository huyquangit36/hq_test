import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Toaster } from "sonner"
import { cn } from "@/lib/utils"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
});

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-body',
  display: 'swap',
  preload: true,
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: 'oklch(0.98 0.01 160)',
}

export const metadata: Metadata = {
  title: {
    default: 'HQ Streetwear | Urban Archive',
    template: '%s | HQ Streetwear'
  },
  description: 'High-end minimalism for the urban culture. Established 2026.',
  metadataBase: new URL('https://your-domain.com'),
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "bg-[#fafafa] selection:bg-[oklch(0.65_0.1_170)] selection:text-white",
        spaceGrotesk.variable,
        inter.variable
      )}
    >
      <body className="font-body antialiased text-[oklch(0.22_0.06_240)] bg-[#fafafa] min-h-screen flex flex-col transition-none">
        {/* Nội dung chính */}
        <div className="flex-1">
          {children}
        </div>

        {/* Hệ thống thông báo Sonner - Sửa lại để đúng vibe Jade/Navy */}
        <Toaster
          position="top-center"
          theme="light"
          expand={false}
          richColors={false}
          toastOptions={{
            style: {
              borderRadius: 0,
              background: 'oklch(0.22 0.06 240)',
              color: 'white',
              border: 'none',
              fontFamily: 'var(--font-sans)',
              textTransform: 'uppercase',
              fontSize: '10px',
              fontStyle: 'italic',
              fontWeight: '900'
            },
          }}
        />

        {/* Analytics chỉ chạy ở Production */}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}