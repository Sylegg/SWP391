import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/contexts/AuthContext'
import { ChatBot } from '@/components/chat-bot'
import './globals.css'

export const metadata: Metadata = {
  title: 'VieCar Web',
  description: 'Nền tảng giới thiệu và trưng bày xe VieCar',
  generator: 'VieCar',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>
          {children}
          <ChatBot />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
