import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chessboard",
  description: "An 8 by 8 chessboard with alternating light and dark squares.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
