
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "EventFlow — Discover Experiences",
    template: "%s | EventFlow",
  },
  description:
    "Discover exciting events, book tickets, and create memorable experiences with EventFlow.",
  applicationName: "EventFlow",
  keywords: [
    "events",
    "event discovery",
    "event tickets",
    "event management",
    "EventFlow",
  ],
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
        {children}

        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              borderRadius: "14px",
              fontFamily: "var(--font-geist-sans), sans-serif",
            },
          }}
        />
      </body>
    </html>
  );
}
