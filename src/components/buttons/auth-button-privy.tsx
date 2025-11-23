"use client";

import { type Dispatch, type SetStateAction } from "react";
import { useLogin, useLogout, usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type AuthButtonProps = {
  children?: React.ReactNode;
  className?: string;
  size?: "default" | "sm" | "lg" | "xl" | "icon" | null | undefined;
  setIsMenuOpen?: Dispatch<SetStateAction<boolean>>;
};

export default function AuthButton({
  children,
  className,
  size = "default",
  setIsMenuOpen,
}: AuthButtonProps) {
  const { ready: isPrivyReady, authenticated } = usePrivy();
  const router = useRouter();

  const { login: loginWithPrivy } = useLogin();
  const { logout: logoutWithPrivy } = useLogout();

  // const disableLogin = !isPrivyReady || (isPrivyReady && authenticated);

  function login() {
    if (!authenticated) {
      loginWithPrivy();
    } else {
      toast.warning("ya existe una sesión activa");
    }
  }
  async function logout() {
    await logoutWithPrivy();
    router.push("/");
    setIsMenuOpen?.(false);
    toast.success("Sesión cerrada correctamente", {
      id: "auth-logout-success",
    });
  }

  if (!isPrivyReady) {
    return null;
  }

  return (
    <Button
      onClick={authenticated ? logout : login}
      size={size}
      className={cn("font-funnel font-medium", className)}
    >
      {authenticated ? "Salir" : children || "Entrar"}
    </Button>
  );
}
