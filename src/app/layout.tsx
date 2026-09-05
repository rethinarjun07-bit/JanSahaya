import type { Metadata } from "next";
import { Inter, Noto_Sans } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/language-provider";
import { AuthProvider } from "@/context/auth-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ClickEffectProvider } from "@/components/click-effect";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoSans = Noto_Sans({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-noto" });

export const metadata: Metadata = {
  title: "JanSahaya | National Societal Innovation & Disaster Mitigation Portal",
  description:
    "Crowdsourcing societal and disaster-related challenges across Indian districts and facilitating collaborative problem-solving through universities, researchers, and industry partnerships (SIH26043 - Govt. of Jharkhand).",
  keywords: [
    "JanSahaya",
    "JanSamadhan",
    "Smart India Hackathon",
    "SIH26043",
    "Disaster Management Jharkhand",
    "Jharia Coal Fire",
    "Morabadi Floods",
    "Crowdsourced Innovation",
    "BIT Mesra",
    "IIT ISM Dhanbad",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${notoSans.variable}`}>
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-amber-100 selection:text-amber-900">
        <LanguageProvider>
          <AuthProvider>
            <ClickEffectProvider />
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
