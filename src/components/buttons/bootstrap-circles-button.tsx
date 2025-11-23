"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { bootstrapCircles } from "@/services/circles/bootstrapCircles";
import { cn } from "@/lib/utils";

type BootstrapCirclesButtonProps = {
  children?: React.ReactNode;
  className?: string;
  size?: "default" | "sm" | "lg" | "xl" | "icon" | null | undefined;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
};

export default function BootstrapCirclesButton({
  children,
  className,
  size = "default",
  variant = "default",
}: BootstrapCirclesButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleBootstrap() {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await bootstrapCircles();
      toast.success("Circles SDK initialized successfully", {
        id: "bootstrap-circles-success",
      });
    } catch (error) {
      console.error("Failed to bootstrap Circles:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to initialize Circles SDK",
        {
          id: "bootstrap-circles-error",
        }
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      onClick={handleBootstrap}
      disabled={isLoading}
      size={size}
      variant={variant}
      className={cn("font-funnel font-medium", className)}
    >
      {isLoading ? "Initializing..." : children || "Bootstrap Circles"}
    </Button>
  );
}
