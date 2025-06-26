import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { ToastProvider, ToastViewport } from "~/components/ui/toast";
import { AuthProvider } from "~/components/providers/session-provider";

export const metadata: Metadata = {
  title: "Data Marketplace | Consumer Data Platform",
  description: "A three-sided marketplace for consumer data sharing with custodial wallet functionality",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} dark`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>
          <ToastProvider swipeDirection="right">
            {children}
            <ToastViewport />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
