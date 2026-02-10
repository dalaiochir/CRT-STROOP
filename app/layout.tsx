import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "CRT + Stroop Test",
  description: "Choice Reaction Time (CRT) exercises + Stroop test",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      <body>
        <Navbar />
        <main className="container">
          {children}
        </main>
        <footer className="footer">
          <span>© {new Date().getFullYear()} CRT + Stroop</span>
        </footer>
      </body>
    </html>
  );
}
