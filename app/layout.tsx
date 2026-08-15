import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Raleway, Open_Sans } from "next/font/google";
import { SITE_URL } from "@/lib/plans";
import "./globals.css";

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Совместимость по стихиям — Огонь, Вода, Земля, Воздух",
  description:
    "Проверь совместимость по стихиям бесплатно. Огонь, Вода, Земля или Воздух — узнай насколько вы подходите друг другу.",
  keywords: [
    "совместимость по стихиям",
    "стихии совместимость",
    "огонь и вода совместимость",
    "знаки стихий",
    "астрология стихии совместимость",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: SITE_URL,
    siteName: "Совместимость по стихиям",
    title: "Совместимость по стихиям — Огонь, Вода, Земля, Воздух",
    description:
      "Проверь совместимость по стихиям бесплатно. Огонь, Вода, Земля или Воздух — узнай насколько вы подходите друг другу.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Совместимость по стихиям — Огонь, Вода, Земля, Воздух",
    description:
      "Проверь совместимость по стихиям бесплатно. Огонь, Вода, Земля или Воздух — узнай насколько вы подходите друг другу.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className={`${raleway.variable} ${openSans.variable}`}>
      <body>
        {children}
        <footer className="site-footer">
          <nav>
            <Link href="/">Главная</Link>
            <Link href="/privacy">Политика конфиденциальности</Link>
            <Link href="/offer">Публичная оферта</Link>
          </nav>
          <p style={{ margin: 0 }}>
            Евдокимов Даниил Владимирович · ИНН 381928138362 · Самозанятый
          </p>
          <p style={{ margin: "4px 0 0" }}>
            danyavdkmvv3@gmail.com · Telegram @dvdkmv
          </p>
          <p style={{ margin: "10px 0 0", opacity: 0.6 }}>
            Материалы носят развлекательный характер. 18+
          </p>
        </footer>
      </body>
    </html>
  );
}
