
"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

// export function Nav({children}: { children: ReactNode }) {
//   return <nav className="bg-primary text-primary-foreground flex justify-end items-center px-4">{children}</nav>
// }

export function Nav({children}: { children: ReactNode }) {
  return (
    <nav className="bg-primary text-primary-foreground flex justify-between items-center px-4">
      {/* Logo on the left */}
      <div className="logo">
        <Link href="/">
          <h1 className="text-3xl italic">Chord Café</h1>
        </Link>
      </div>

      {/* Navigation links on the right */}
      <div className="nav-links flex gap-4">
        {children}
      </div>
    </nav>
  );
}

export function NavLink(props: Omit<ComponentProps<typeof Link>, "className">) {
  const pathname = usePathname()
  return <Link {...props} className={cn("p-4 hover:bg-secondary hover:text-secondary-foreground focus-visible:bg-secondary focus-visible:text-secondary-foreground", pathname === props.href && "bg-background text-foreground", "transition-colors duration-200")}/>
}