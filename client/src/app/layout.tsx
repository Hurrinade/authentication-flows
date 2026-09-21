import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MessagesProvider } from "./contexts/MessagesProvider";
import { UserProvider } from "./contexts/UserProvider";
import QueryProvider from "./components/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://auth.rinadely.com";
const siteTitle =
  "Auth methods | JWT, refresh token, and session authentication demo";
const siteDescription =
  "A working demo of three authentication patterns: stateless JWT, hybrid access and refresh tokens with rotation, and stateful sessions, with salted password hashing.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  alternates: {
    canonical: "./",
  },
  openGraph: {
    type: "website",
    siteName: "Auth methods",
    title: siteTitle,
    description: siteDescription,
    url: "./",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Auth methods: JWT, refresh token, and session authentication demo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <UserProvider>
            <MessagesProvider>{children}</MessagesProvider>
          </UserProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
