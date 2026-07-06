import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Handprint",
  description: "Find useful local action and grow your visible handprint."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
