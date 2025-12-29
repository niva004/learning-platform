import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TradeMasterPro - Profesjonalne Szkolenia Tradingowe 2025',
  description: 'Dołącz do ponad 2,800 traderów i naucz się zarabiać na rynkach finansowych. Sprawdzone strategie, live trading sessions i wsparcie mentora. Rozpocznij swoją podróż z TradeMasterPro.',
  keywords: 'trading, forex, kursy tradingowe, szkolenia trading, nauka tradingu, price action, analiza techniczna',
  authors: [{ name: 'TradeMasterPro' }],
  openGraph: {
    title: 'TradeMasterPro - Profesjonalne Szkolenia Tradingowe',
    description: 'Naucz się zarabiać na rynkach finansowych ze sprawdzonymi strategiami i wsparciem ekspertów.',
    type: 'website',
    locale: 'pl_PL',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
