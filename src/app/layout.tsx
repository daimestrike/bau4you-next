import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthCleaner from "@/components/AuthCleaner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://bau4you.co'),
  title: "Bau4You - Цифровая платформа для строительства",
  description: "Bau4You - это онлайн-платформа, соединяющая местных разнорабочих и клиентов. Наша миссия - упростить процесс поиска и найма квалифицированных специалистов для решения любых задач, связанных со строительством.",
  keywords: ["строительство", "ремонт", "тендеры", "подрядчики", "строительные материалы", "специалисты"],
  authors: [{ name: "Bau4You" }],
  creator: "Bau4You",
  publisher: "Bau4You",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "https://bau4you.co",
    siteName: "Bau4You",
    title: "Bau4You - Цифровая платформа для строительства",
    description: "Bau4You - это онлайн-платформа, соединяющая местных разнорабочих и клиентов. Наша миссия - упростить процесс поиска и найма квалифицированных специалистов для решения любых задач, связанных со строительством.",
    images: [
      {
        url: "/images/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Bau4You - Цифровая платформа для строительства",
      },
      {
        url: "/images/logo.png",
        width: 512,
        height: 512,
        alt: "Логотип Bau4You",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bau4You - Цифровая платформа для строительства",
    description: "Bau4You - это онлайн-платформа, соединяющая местных разнорабочих и клиентов. Наша миссия - упростить процесс поиска и найма квалифицированных специалистов для решения любых задач, связанных со строительством.",
    images: ["/images/og-default.jpg", "/images/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        {/* Yandex.Metrika counter */}
        <Script
          id="yandex-metrika"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
              (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

              ym(102665197, "init", {
                   clickmap:true,
                   trackLinks:true,
                   accurateTrackBounce:true
              });
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased pt-20`}
        suppressHydrationWarning={true}
      >
        {/* Yandex.Metrika noscript */}
        <noscript>
          <div>
            <img 
              src="https://mc.yandex.ru/watch/102665197" 
              style={{position: 'absolute', left: '-9999px'}} 
              alt="" 
            />
          </div>
        </noscript>
        
        <AuthCleaner />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
