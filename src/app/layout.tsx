import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: "Глоссарий | Зарубежная литература XIX века",
  description: "Глоссарий по ДО-курсу НовГУ по зарубежной литературе XIX века.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
