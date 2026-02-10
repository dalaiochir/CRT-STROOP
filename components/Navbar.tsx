"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Нүүр" },
  { href: "/instructions", label: "Заавар" },
  { href: "/test", label: "Тест" },
  { href: "/history", label: "Түүх" },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <header className="nav">
      <div className="navInner">
        <div className="brand">
          <span className="badge" />
          <span>CRT + Stroop</span>
        </div>
        <nav className="navLinks">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                className={"navLink " + (active ? "navLinkActive" : "")}
                href={l.href}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
