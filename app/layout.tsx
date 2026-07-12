import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mission Barisal - AI Code Assistant',
  description: 'Multi-agent AI assistant for code explanation, debugging, and architecture analysis. Powered by Mission Barisal Server.',
  generator: 'Mission Barisal',
  keywords: ['AI', 'Code Assistant', 'GitHub Copilot', 'Code Analysis', 'Documentation'],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'Mission Barisal - AI Code Assistant',
    description: 'Multi-agent AI system for comprehensive code analysis and documentation',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-white">
      <body className={`font-sans antialiased bg-white ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
