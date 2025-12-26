import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FormRelay | Contact Form Backend Service",
  description: "The easiest way to add contact forms to your website. No backend code required. Get email notifications, spam protection, and a real-time dashboard.",
  keywords: ["contact form", "form backend", "headless forms", "email notifications", "spam protection", "nextjs", "supabase"],
  authors: [{ name: "Varshith V Hegde", url: "https://github.com/Varshithvhegde" }],
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://formrelay.app",
    title: "FormRelay | Contact Form Backend Service",
    description: "Production-ready contact form backend as a service.",
    siteName: "FormRelay",
    images: [
      {
        url: "/logo.png",
        width: 1024,
        height: 1024,
        alt: "FormRelay Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FormRelay",
    description: "Contact forms made simple.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased font-sans bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
