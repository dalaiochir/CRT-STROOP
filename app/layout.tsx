import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";

// export const metadata: Metadata = {
//   title: "CRT + Stroop Test",
//   description: "Choice Reaction Time (CRT) exercises + Stroop test",
// };

export const metadata = {
  title: "CRT • Stroop Test",
  icons: {
    icon: [
      {
        url:
          'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><text y="50" font-size="50">🧠</text></svg>',
      },
    ],
  },
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
