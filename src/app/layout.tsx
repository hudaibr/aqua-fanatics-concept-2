import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Morning Catch — A Fish Market You Walk Through",
  description:
    "An interactive 3D fish market. Walk the hall, examine the day's catch on the ice, choose your preparation and build your basket.",
};

export const viewport: Viewport = {
  themeColor: "#0E100F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,700;0,6..96,900;1,6..96,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
