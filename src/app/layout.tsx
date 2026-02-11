import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "slapDiary - 自分専用日記アプリ",
  description: "マルチデバイス対応の個人用日記アプリ",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/diaryicon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/diaryicon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/diaryicon-192x192.png",
  },
  themeColor: "#3b82f6",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
