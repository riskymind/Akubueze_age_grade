import type { Metadata } from "next";
import SessionProvider from "@/components/providers/SessionProvider";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Akubueze",
  description: "Age Grade Association Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col">
        <SessionProvider>{children}</SessionProvider>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
