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

export const metadata: Metadata = {
  title: "Auth methods | JWT, refresh token, and session authentication demo",
  description:
    "A working demo of three authentication patterns: stateless JWT, hybrid access and refresh tokens with rotation, and stateful sessions, with salted password hashing.",
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
