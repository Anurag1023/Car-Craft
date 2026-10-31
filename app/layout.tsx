import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RootProvider } from "@/components/providers/root-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CarCraft - Automotive Inventory & Dealership Suite",
  description: "Enterprise multi-dealership vehicle inventory management, accessories e-commerce, and service appointment scheduling platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
