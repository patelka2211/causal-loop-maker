import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000"),
  ),
  title: {
    default: "Ouro",
    template: "%s | Ouro",
  },
  description: "Create, visualize, and manage causal loop diagrams.",
  icons: {
    icon: [{ url: "/ouro-favicon.svg", type: "image/svg+xml" }],
    apple: "/ouro-favicon.svg",
  },
  openGraph: {
    title: "Ouro",
    description: "Create, visualize, and manage causal loop diagrams.",
    siteName: "Ouro",
    images: [
      {
        url: "/ouro-opengraph.png",
        width: 1200,
        height: 630,
        alt: "Ouro - Causal Loop Diagrams",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ouro",
    description: "Create, visualize, and manage causal loop diagrams.",
    images: ["/ouro-opengraph.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", "font-sans", inter.variable)}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
