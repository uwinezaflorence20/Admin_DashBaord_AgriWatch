import "./globals.css";
import { Inter } from "next/font/google";
import I18nProvider from "@/components/layout/I18nProvider";

import { Toaster } from "sonner";
import JsonLd from "@/components/seo/JsonLd";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: {
    default: "AgriWatch",
    template: "%s | AgriWatch"
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  description: "AgriWatch is an AI-powered platform that detects late blight disease in potato crops, helping farmers protect their harvest through early detection and smart monitoring.",
  keywords: [
    "AgriWatch", "potato disease detection", "late blight detection", "AI agriculture",
    "potato late blight", "smart farming", "crop disease AI", "potato disease Rwanda",
    "agriculture technology", "AI plant disease", "Phytophthora infestans detection",
    "precision agriculture", "crop monitoring", "potato farming Rwanda"
  ],
  authors: [{ name: "AgriWatch" }],
  creator: "AgriWatch",
  publisher: "AgriWatch",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://www.agriwatch.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AgriWatch | AI Potato Disease Detection",
    description: "AgriWatch uses AI to detect late blight disease in potato crops early, helping farmers save their harvest.",
    url: "https://www.agriwatch.com",
    siteName: "AgriWatch",
    images: [
      {
        url: "/Home.jpeg",
        width: 1200,
        height: 630,
        alt: "AgriWatch - AI Potato Disease Detection",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgriWatch | AI Potato Disease Detection",
    description: "AI-powered early detection of late blight disease in potato crops.",
    images: ["/Home.jpeg"],
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
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <I18nProvider>
          <JsonLd />
          {children}
          <Toaster position="top-right" richColors />
        </I18nProvider>
      </body>
    </html>
  );
}
