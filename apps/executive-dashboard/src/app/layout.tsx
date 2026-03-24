import type { Metadata } from "next";
import "@/styles/globals.css";
import { BRANDING } from "@/config/branding";

export const metadata: Metadata = {
  title: BRANDING.metadata.title,
  description: BRANDING.metadata.description,
  keywords: [...BRANDING.metadata.keywords],
  authors: [{ name: BRANDING.metadata.author }],
  generator: BRANDING.metadata.generator,
  openGraph: {
    title: BRANDING.metadata.title,
    description: BRANDING.metadata.description,
    siteName: BRANDING.product.company,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-deevo-bg text-deevo-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
