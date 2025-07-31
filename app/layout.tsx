import type React from "react"
import type { Metadata } from "next"
import { Montserrat, Bebas_Neue } from "next/font/google"
import "./globals.css"
import HeaderWithSidebar from "@/components/header-with-sidebar"
import Footer from "@/components/footer"

// Подключаем Montserrat через Google Fonts
const montserrat = Montserrat({ 
  subsets: ["latin", "cyrillic"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat"
})

// Подключаем Bebas Neue через Google Fonts
const bebasNeue = Bebas_Neue({ 
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bebas-neue"
})

export const metadata: Metadata = {
  title: "Aria Toys - Детские игрушки",
  description: "Интернет-магазин качественных детских игрушек",
  keywords: ["детские игрушки", "aria toys", "игрушки для детей", "интернет магазин игрушек"],
  authors: [{ name: "Aria Toys" }],
  creator: "Aria Toys",
  publisher: "Aria Toys",
  metadataBase: new URL('https://aria-toys.ru'),
  manifest: '/manifest.json',
  openGraph: {
    title: 'Aria Toys - Детские игрушки',
    description: 'Интернет-магазин качественных детских игрушек',
    url: 'https://aria-toys.ru',
    siteName: 'Aria Toys',
    images: [
      {
        url: '/icon.svg',
        width: 1200,
        height: 630,
        alt: 'Aria Toys Logo',
      },
    ],
    locale: 'ru_RU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aria Toys - Детские игрушки',
    description: 'Интернет-магазин качественных детских игрушек',
    images: ['/icon.svg'],
  },
  icons: {
    icon: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      }
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={`${montserrat.variable} ${bebasNeue.variable} bg-sky-50 font-bebas`}>
          <div className="flex min-h-screen flex-col">
            <HeaderWithSidebar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
      </body>
    </html>
  )
}
