import localFont from "next/font/local";
import "./globals.css";

export const metadata = {
  title: "Cuanto Cada Uno",
  description: "App para sacar cuentas claras",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
