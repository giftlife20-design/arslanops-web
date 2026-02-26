import type { Metadata } from "next";
import "./globals.css";
import { Inter, Playfair_Display } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "ArslanOps | İlhan Arslan - Coffee & Restoran Operasyon Danışmanlığı",
  description: "25+ yıllık deneyimle coffee ve restoranlarda maliyet kontrolü, stok yönetimi, COGS optimizasyonu ve operasyon düzeni kurma konusunda uzman danışmanlık hizmeti.",
  keywords: "restoran danışmanlığı, coffee danışmanlığı, maliyet kontrolü, stok yönetimi, operasyon, COGS, fire kontrolü, kafe danışmanlık, restoran operasyon, İlhan Arslan, ArslanOps",
  authors: [{ name: "İlhan Arslan", url: "https://arslanops.com" }],
  creator: "ArslanOps",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    title: "ArslanOps | Coffee & Restoran Operasyon Danışmanlığı",
    description: "25+ yıllık saha deneyimiyle stok, satın alma, kasa akışını toplar ve takip edilebilir sistem kurarım.",
    type: "website",
    locale: "tr_TR",
    siteName: "ArslanOps",
    url: "https://arslanops.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "ArslanOps | Coffee & Restoran Operasyon Danışmanlığı",
    description: "25+ yıllık saha deneyimiyle stok, satın alma, kasa akışını toplar ve takip edilebilir sistem kurarım.",
  },
  alternates: {
    canonical: "https://arslanops.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        {/* Google Analytics - add your GA4 ID in .env.local as NEXT_PUBLIC_GA_ID */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `
              }}
            />
          </>
        )}
      </head>
      <body className={`${inter.variable} ${playfair.variable} ${inter.className}`}>{children}</body>
    </html>
  );
}
