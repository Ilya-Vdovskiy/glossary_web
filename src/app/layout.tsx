import type { Metadata } from "next";
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
      <body>{children}</body>
    </html>
  );
}
