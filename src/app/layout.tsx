import type { Metadata, Viewport } from "next";
import { Fraunces, Karla, Geist } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "@/components/ui/Toaster";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const karla = Karla({
  subsets: ["latin"],
  variable: "--font-karla",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Plus Près — un jeu à deux, par paliers",
    template: "%s · Plus Près",
  },
  description:
    "Trois niveaux de questions, des réponses croisées en aveugle, un score de compatibilité qui se révèle manche après manche.",
  applicationName: "Plus Près",
  appleWebApp: { title: "Plus Près" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf4ee" },
    { media: "(prefers-color-scheme: dark)", color: "#141013" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={cn(fraunces.variable, karla.variable, "font-sans", geist.variable)}>
      <body>
        <div className="ambient" aria-hidden="true">
          <span className="ambient__blob ambient__blob--rose" />
          <span className="ambient__blob ambient__blob--gold" />
          <span className="ambient__blob ambient__blob--sage" />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col">
          <Providers>{children}</Providers>
        </div>

        <Toaster />
      </body>
    </html>
  );
}
