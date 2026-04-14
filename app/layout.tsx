import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FisioGestiona - Sistema de Gestión para Centros de Kinesiología",
  description:
    "Gestiona pacientes, turnos y sesiones de forma eficiente. Diseñado para profesionales de la kinesiología.",
  keywords: [
    "kinesiología",
    "fisioterapia",
    "gestión",
    "turnos",
    "pacientes",
    "centro médico",
  ],
  authors: [{ name: "FisioGestiona" }],
  metadataBase: new URL("https://fisiogestiona.com"),
  openGraph: {
    title: "FisioGestiona - Gestión Profesional para Kinesiología",
    description: "Sistema completo para gestionar tu centro de kinesiología",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="es" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
