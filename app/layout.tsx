import type { Metadata } from "next";
import { Manrope, DM_Serif_Display, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { AuthBootstrap } from "@/components/account/AuthBootstrap";
import { AccountBootstrap } from "@/components/account/AccountBootstrap";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dm-serif",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Plantik — Plantas. Diseño. Bienestar.",
  description:
    "Diseña, arma y cuida la planta perfecta para tu espacio con Plantik.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`${manrope.variable} ${dmSerif.variable} ${spaceGrotesk.variable} ${plexMono.variable} font-sans`}
      >
        <AuthBootstrap />
        <AccountBootstrap />
        {children}
      </body>
    </html>
  );
}
