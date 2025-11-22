"use client";

import { useState } from "react";
import Link from "next/link";
import {
  SheetTrigger,
  SheetContent,
  Sheet,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { MenuIcon, SparkleIcon } from "lucide-react";
import { type MenuItemType } from "./navbar";
import AuthButton from "@/components/buttons/auth-button-privy";
import { cn } from "@/lib/utils";

type MobileMenuProps = {
  menuItems?: MenuItemType[];
  pathname: string;
};

export default function MobileMenu({ menuItems, pathname }: MobileMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <SheetTrigger asChild>
        <button className="bg-transparent p-1.5 text-white lg:hidden">
          <MenuIcon className="h-10 w-10 text-primary" />
          <span className="sr-only">Toggle navigation menu</span>
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="bg-background pt-16 md:pt-12">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <SheetDescription className="sr-only">
          Navigation items
        </SheetDescription>
        <div className="grid gap-2 py-6">
          {menuItems?.map((menuItem, index) => (
            <Link
              key={`${menuItem.displayText}-menuItem-${index}`}
              className={cn(
                "inline-flex items-center justify-center px-4 py-2 text-lg font-medium text-foreground transition-colors hover:text-primary focus:text-primary focus:outline-none",
                pathname === menuItem.href &&
                  "pointer-events-none underline decoration-primary decoration-[1.5px] underline-offset-[6px] hover:text-secondary-foreground!"
              )}
              href={menuItem.href}
            >
              {menuItem.displayText}
            </Link>
          ))}
          <div className="flex justify-center py-2">
            <AuthButton size="lg" setIsMenuOpen={setIsMenuOpen}>
              <SparkleIcon className="mr-2 -ml-2 h-4 w-4 fill-background" />{" "}
              Únete
            </AuthButton>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
