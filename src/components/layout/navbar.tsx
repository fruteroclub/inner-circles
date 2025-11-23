"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import MobileMenu from "./mobile-menu";
import AuthButton from "@/components/buttons/auth-button-privy";
import { SparkleIcon } from "lucide-react";
import Image from "next/image";

export type MenuItemType = {
  displayText: string;
  href: string;
  isMobileOnly: boolean;
  isExternal?: boolean;
};

const MENU_ITEMS: MenuItemType[] = [
  {
    displayText: "Communities",
    href: "/communities",
    isMobileOnly: false,
  },
  {
    displayText: "Earn",
    href: "/earn",
    isMobileOnly: false,
  },
  {
    displayText: "Credit",
    href: "/credit",
    isMobileOnly: false,
  },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 h-24 w-full bg-background">
      <div className="mx-auto flex h-full w-full max-w-3xl items-center justify-between p-4 sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-5 lg:px-8">
        <Link className="flex items-center" href="/">
          <Image
            src="/images/logos/token.png"
            alt="(Inner Circles) logo"
            width={32}
            height={32}
            className="mr-2"
          />
          <span className="text-2xl font-bold text-[#4941AD]">(Inner</span>

          <span className="ml-0.5 text-2xl font-bold text-[#FE5855]">
            Circles)
          </span>
        </Link>
        <div className="z-10 col-span-3 flex items-center justify-center">
          <nav className="hidden gap-4 lg:flex">
            {MENU_ITEMS.filter((menuItem) => !menuItem.isMobileOnly).map(
              (menuItem, index) => (
                <Link
                  key={`${menuItem.displayText}-menuItem-${index}`}
                  className={`inline-flex items-center justify-center px-4 py-2 font-funnel text-xl font-medium text-foreground transition-colors hover:text-primary focus:text-primary focus:outline-none ${
                    pathname === menuItem.href &&
                    "pointer-events-none underline decoration-primary decoration-2 underline-offset-[6px] hover:text-foreground!"
                  }`}
                  href={menuItem.href}
                  target={menuItem.isExternal ? "_blank" : ""}
                >
                  {menuItem.displayText}
                </Link>
              )
            )}
          </nav>
        </div>
        <div className="hidden lg:flex lg:justify-end">
          <AuthButton size="lg">
            <SparkleIcon className="mr-2 -ml-2 h-4 w-4 fill-background" /> Get
            Started
          </AuthButton>
        </div>
        <MobileMenu menuItems={MENU_ITEMS} pathname={pathname} />
      </div>
    </header>
  );
}
