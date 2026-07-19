import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.amolluservices.com"),
  title: {
    default: "Amollu Services | Property Care & Facility Solutions",
    template: "%s | Amollu Services",
  },
  description:
    "Request residential cleaning, commercial property care, maintenance support, recurring upkeep, and facility solutions from Amollu Services.",
  applicationName: "Amollu Services",
  keywords: [
    "Amollu Services",
    "property care services",
    "residential cleaning",
    "commercial cleaning",
    "facility solutions",
    "maintenance support",
    "recurring property care",
    "property upkeep",
    "quote request",
  ],
  authors: [{ name: "Amollu Services" }],
  creator: "Amollu Services",
  publisher: "Amollu Services",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "Amollu Services | Property Care & Facility Solutions",
    description:
      "Quote-based residential, commercial, and facility care services for cleaning, maintenance support, recurring upkeep, and property coordination.",
    url: "https://www.amolluservices.com",
    siteName: "Amollu Services",
    images: [
      {
        url: "/brand/amollu-logo-horizontal.png",
        width: 1200,
        height: 655,
        alt: "Amollu Services property care and facility solutions logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Amollu Services | Property Care & Facility Solutions",
    description:
      "Request quote-based property care, cleaning, maintenance support, and facility solutions from Amollu Services.",
    images: ["/brand/amollu-logo-horizontal.png"],
  },
  category: "Property services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body>{children}</body>
    </html>
  );
}
