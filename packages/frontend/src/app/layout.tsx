import type { Metadata } from "next";
import { Oswald, Work_Sans, Space_Mono } from "next/font/google";
import "./globals.css";

// Oswald: condensada, com cara de crachá/placa automotiva -- usada nos
// títulos e no motivo visual da placa (ver components/ui/Placa.tsx).
const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

// Work Sans: geométrica e neutra, para o corpo do texto -- legibilidade em
// primeiro lugar nas seções mais longas (histórias, descrições de evento).
const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Space Mono: reforça o motivo da "placa" (datas, tags, fichas técnicas).
const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Veteran Carclub | Encontros de carros antigos em Joinville",
  description:
    "Divulgação de encontros de carros antigos e registro histórico dos veículos e donos que já passaram pelo Veteran Carclub, em Joinville/SC.",
  icons: {
    icon: "/logo-favicon.png",
    shortcut: "/logo-favicon.png",
    apple: "/logo-favicon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${oswald.variable} ${workSans.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
