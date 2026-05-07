import type { Metadata } from 'next'
import { Space_Grotesk, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next' // Đã sửa lỗi: thêm dấu gạch chéo
import './globals.css'

// Cấu hình font Sans chính (dùng cho tiêu đề, các nút bấm)
const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: '--font-sans',
  display: 'swap'
});

// Cấu hình font Body (dùng cho các đoạn văn bản dài)
const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-body',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'HQ Streetwear | Urban Fashion',
  description: 'Premium streetwear for the culture. Shop the latest drops in hoodies, tees, and more.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // Ép buộc giao diện sáng cho trình duyệt
    <html lang="en" className="bg-background scroll-smooth" style={{ colorScheme: 'light' }}>
      <body className={`${spaceGrotesk.variable} ${inter.variable} font-sans antialiased bg-background text-foreground`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}