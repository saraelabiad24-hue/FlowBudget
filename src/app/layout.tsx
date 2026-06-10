import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/features/auth/AuthContext";
import { HeroUIProvider } from "@heroui/react";

export const metadata: Metadata = {
  title: "flowbudget",
  description: "Smart financial management made simple",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <HeroUIProvider>
          <AuthProvider>{children}</AuthProvider>
        </HeroUIProvider>
      </body>
    </html>
  );
}
