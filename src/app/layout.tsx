import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const description =
  "Search arXiv, Semantic Scholar, and Crossref at once, save the papers you like, and get a ready-made prompt to have an LLM summarize any of them.";

export const metadata: Metadata = {
  metadataBase: new URL("https://paper-finder-five.vercel.app"),
  title: "Paper Finder",
  description,
  openGraph: {
    title: "Paper Finder",
    description,
    url: "https://paper-finder-five.vercel.app",
    siteName: "Paper Finder",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Paper Finder",
    description,
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
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-cream text-ink">
        {children}
      </body>
    </html>
  );
}
