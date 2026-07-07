import React from "react";
import logoUrl from "../assets/images/nomicomputers_logo_1783305137590.jpg";

interface LogoProps {
  className?: string;
  size?: number;
  variant?: "color" | "monochrome" | "watermark";
}

export default function Logo({ className = "", size = 120, variant = "color" }: LogoProps) {
  const isWatermark = variant === "watermark";
  
  return (
    <img
      src={logoUrl}
      alt="Nomi Computers Dunyapur Logo"
      style={{
        width: size ? `${size}px` : "auto",
        height: "auto",
        objectFit: "contain",
      }}
      referrerPolicy="no-referrer"
      className={`select-none pointer-events-none transition-all ${
        isWatermark ? "opacity-10 mix-blend-multiply" : "max-h-[120px]"
      } ${className}`}
    />
  );
}

