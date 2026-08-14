/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface PhoneLetterOProps {
  className?: string;
  size?: number | string;
  colorClass?: string;
  screenClass?: string;
  showScreenGlow?: boolean;
}

/**
 * Custom SVG component for the letter "O" in the EthioPhone logo.
 * Integrates a sleek, rounded-rectangle modern smartphone silhouette into the letter "O".
 * Remains instantly recognizable as the letter "O" while incorporating smartphone hardware details
 * (rounded corner chassis, screen counter-hole, dynamic island notch, speaker line, home indicator bar, and side buttons).
 */
export const PhoneLetterO: React.FC<PhoneLetterOProps> = ({
  className = "h-[0.92em] w-auto inline-block align-baseline mx-[0.02em]",
  size,
  colorClass = "text-[var(--color-gold)]",
  screenClass = "fill-[var(--color-paper)] dark:fill-[var(--color-ink)]",
  showScreenGlow = false
}) => {
  return (
    <svg
      viewBox="0 0 20 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${colorClass} transition-colors duration-200 select-none`}
      style={size ? { height: size, width: "auto" } : undefined}
      aria-label="Smartphone letter O"
      role="img"
    >
      <defs>
        <linearGradient id="phoneBodyGold" x1="0" y1="0" x2="20" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--color-gold)" />
          <stop offset="50%" stopColor="#3385FF" />
          <stop offset="100%" stopColor="var(--color-gold)" />
        </linearGradient>
      </defs>

      {/* Outer Smartphone Frame / Letter O Outer Body */}
      <rect
        x="0.75"
        y="0.75"
        width="18.5"
        height="24.5"
        rx="5.5"
        ry="5.5"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.5"
      />

      {/* Inner Screen Cutout / Letter O Counter Hole */}
      <rect
        x="4.25"
        y="4.5"
        width="11.5"
        height="17"
        rx="2.75"
        ry="2.75"
        className={screenClass}
      />

      {/* Optional Subtle Screen Glow / Auction Wave */}
      {showScreenGlow && (
        <rect
          x="4.25"
          y="4.5"
          width="11.5"
          height="17"
          rx="2.75"
          ry="2.75"
          fill="currentColor"
          opacity="0.12"
        />
      )}

      {/* Top Dynamic Island / Camera Notch */}
      <rect
        x="7.25"
        y="2.2"
        width="5.5"
        height="1.4"
        rx="0.7"
        className={screenClass}
        opacity="0.95"
      />

      {/* Top Earpiece / Speaker Grill */}
      <line
        x1="8.5"
        y1="1.4"
        x2="11.5"
        y2="1.4"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeLinecap="round"
        opacity="0.4"
      />

      {/* Bottom Home Indicator Bar */}
      <rect
        x="7.5"
        y="22.8"
        width="5"
        height="0.9"
        rx="0.45"
        className={screenClass}
        opacity="0.8"
      />

      {/* Left Volume Buttons */}
      <rect x="0" y="7.5" width="0.75" height="2.8" rx="0.375" fill="currentColor" />
      <rect x="0" y="11.5" width="0.75" height="2.8" rx="0.375" fill="currentColor" />

      {/* Right Power Button */}
      <rect x="19.25" y="9.5" width="0.75" height="3.8" rx="0.375" fill="currentColor" />
    </svg>
  );
};

interface LogoMarkProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Standalone Logo Emblem featuring the smartphone-silhouette letter "O"
 * inside a rounded metallic badge with gold accent glow.
 */
export const LogoMark: React.FC<LogoMarkProps> = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "p-1.5 rounded-lg shadow-sm",
    md: "p-2 rounded-xl shadow-md",
    lg: "p-3 rounded-2xl shadow-lg"
  };

  const iconSizes = {
    sm: "h-5",
    md: "h-6",
    lg: "h-8"
  };

  return (
    <div
      className={`bg-[var(--color-gold)] text-[var(--color-paper)] dark:text-[var(--color-ink)] ${sizeClasses[size]} flex items-center justify-center transition-transform hover:scale-105 active:scale-95 ${className}`}
      id="nav-logo-icon"
    >
      <PhoneLetterO
        className={`${iconSizes[size]} w-auto text-[var(--color-paper)] dark:text-[var(--color-ink)]`}
        screenClass="fill-[var(--color-gold)]"
        showScreenGlow
      />
    </div>
  );
};

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showAuctionBadge?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * Complete YONIMobile Brand Logo Component.
 * Features an elegant typographic wordmark ("YONIMobile Auction") with the sleek
 * smartphone silhouette seamlessly integrated into the letter "O" in "Mobile".
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = "md",
  showAuctionBadge = true,
  onClick,
  className = ""
}) => {
  const textSizeClasses = {
    sm: "text-lg sm:text-xl",
    md: "text-2xl sm:text-3xl",
    lg: "text-3xl sm:text-4xl"
  };

  const badgeTextClasses = {
    sm: "text-[10px]",
    md: "text-[11px] sm:text-[12px]",
    lg: "text-xs sm:text-sm"
  };

  return (
    <div
      className={`inline-flex items-center gap-2 sm:gap-3 cursor-pointer select-none group ${className}`}
      onClick={onClick}
      id="brand-logo-container"
    >
      {/* Wordmark: YONIMobile */}
      <div className="flex items-center leading-none">
        <span
          className={`font-sans-logo font-black tracking-tight ${textSizeClasses[size]} text-[var(--color-ink)] dark:text-[var(--color-paper)] flex items-center transition-colors group-hover:text-[var(--color-gold)]`}
        >
          {/* YONI in luxurious Gold Serif Italic */}
          <span className="font-serif-logo italic font-extrabold text-[var(--color-gold)] mr-[0.04em] tracking-normal">
            YONI
          </span>
          
          {/* M + Smartphone O + bile */}
          <span className="font-extrabold tracking-tight flex items-center">
            <span>M</span>
            <PhoneLetterO 
              colorClass="text-[var(--color-gold)]" 
              className="h-[0.88em] w-auto inline-block align-middle mx-[0.02em] transition-transform duration-300 group-hover:scale-105" 
            />
            <span>bile</span>
          </span>
        </span>

        {/* Elegant "AUCTION" Divider Sub-badge */}
        {showAuctionBadge && (
          <div className="flex items-center ml-2.5 sm:ml-3 pl-2.5 sm:pl-3 border-l border-[var(--color-gold)]/35 dark:border-[var(--color-gold)]/40">
            <span
              className={`font-sans-logo font-extrabold uppercase tracking-[0.22em] text-[var(--color-gold)] ${badgeTextClasses[size]} leading-none`}
            >
              Auction
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandLogo;
