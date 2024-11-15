"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentProps, ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

export function Nav({ children }: { children: ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <nav className="bg-primary text-primary-foreground px-4 py-2 flex justify-between items-center">
      {/* Logo */}
      <div className="logo">
        <Link href="/">
          <h1 className="text-3xl italic">Chord Café</h1>
        </Link>
      </div>

      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-secondary"
        aria-label="Toggle Menu"
      >
        {/* Hamburger Icon */}
        <span className="block w-6 h-0.5 bg-primary-foreground mb-1"></span>
        <span className="block w-6 h-0.5 bg-primary-foreground mb-1"></span>
        <span className="block w-6 h-0.5 bg-primary-foreground"></span>
      </button>

      {/* Navigation Links */}
      <div
        className={cn(
          "nav-links md:flex gap-4 transition-all duration-300",
          isMenuOpen ? "block" : "hidden",
          "absolute md:relative md:block bg-primary md:bg-transparent w-full md:w-auto top-14 left-0 md:top-0 z-50"
        )}
      >
        {children}
      </div>
    </nav>
  );
}

export function NavLink(props: Omit<ComponentProps<typeof Link>, "className">) {
  const pathname = usePathname();
  return (
    <Link
      {...props}
      className={cn(
        "p-4 hover:bg-secondary hover:text-secondary-foreground focus-visible:bg-secondary focus-visible:text-secondary-foreground",
        pathname === props.href && "bg-background text-foreground",
        "transition-colors duration-200"
      )}
    />
  );
}