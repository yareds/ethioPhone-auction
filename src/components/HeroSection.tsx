/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, ShieldCheck, Gavel, Video, Play, Upload, X, RotateCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "../context/AppContext";
import { UserRole } from "../types";

export default function HeroSection() {
  const { currentUser } = useApp();
  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(() => {
    return localStorage.getItem("hero_custom_video_url");
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomVideoUrl(url);
      setIsUploading(false);

      // Save to localStorage if possible
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          try {
            localStorage.setItem("hero_custom_video_url", result);
          } catch (err) {
            console.warn("Video file too large for localStorage persistence");
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveVideo = () => {
    setCustomVideoUrl(null);
    localStorage.removeItem("hero_custom_video_url");
  };

  return (
    <div className="relative rounded-3xl overflow-hidden border border-gray-150 dark:border-slate-800 bg-slate-950 text-white shadow-2xl min-h-[420px] sm:min-h-[460px] flex items-center mb-8" id="hero-section">
      
      {/* Background Media / 3D Animation Layer */}
      <div 
        className="absolute inset-y-0 right-0 w-full lg:w-[50%] select-none z-10 overflow-hidden flex items-center justify-center p-4 sm:p-8" 
        id="hero-media-wrapper"
      >
        {customVideoUrl ? (
          <div className="relative w-full h-full max-h-[380px] rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-black">
            <video
              src={customVideoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-contain"
            />
            {isAdmin && (
              <button
                onClick={handleRemoveVideo}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-all backdrop-blur-md border border-slate-700 cursor-pointer"
                title="Remove custom video"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          /* Animated 3D Titanium Smartphone Showcase (Inspired by Luma AI 3D Render) */
          <div className="relative w-full h-full flex items-center justify-center perspective-[1200px]">
            {/* Background ambient lighting */}
            <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-indigo-600/30 via-purple-500/20 to-cyan-400/20 blur-[90px] pointer-events-none" />
            
            <motion.div
              animate={{
                rotateY: [0, 360],
                rotateX: [-8, 8, -8],
                y: [-6, 6, -6],
              }}
              transition={{
                rotateY: { duration: 16, repeat: Infinity, ease: "linear" },
                rotateX: { duration: 8, repeat: Infinity, ease: "easeInOut" },
                y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
              className="relative w-56 sm:w-64 h-[320px] sm:h-[360px] [transform-style:preserve-3d]"
            >
              {/* Phone 1: Back View (Metallic Silver / Titanium) */}
              <div className="absolute inset-0 rounded-[36px] bg-gradient-to-br from-slate-200 via-slate-400 to-slate-700 p-1 shadow-2xl border border-slate-300/40 [transform:translateZ(30px)] backdrop-blur-md">
                <div className="w-full h-full rounded-[32px] bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 relative overflow-hidden flex flex-col items-center justify-between p-4">
                  
                  {/* Camera Bump */}
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-700/80 via-slate-800/90 to-slate-900 border border-slate-600/60 shadow-inner p-2 grid grid-cols-2 gap-1.5 self-start ml-2 mt-1">
                    <div className="rounded-full bg-black border border-slate-500/50 flex items-center justify-center relative">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 animate-pulse" />
                    </div>
                    <div className="rounded-full bg-black border border-slate-500/50 flex items-center justify-center relative">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-400/80" />
                    </div>
                    <div className="col-span-2 rounded-full bg-black border border-slate-500/50 flex items-center justify-center relative w-7 h-7 mx-auto">
                      <div className="w-3 h-3 rounded-full bg-slate-800 border border-slate-600" />
                    </div>
                  </div>

                  {/* Metallic Apple / Brand Emblem Glow */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-400/30 via-slate-100/40 to-slate-400/10 backdrop-blur-sm border border-white/20 shadow-lg flex items-center justify-center my-auto">
                    <Sparkles className="h-5 w-5 text-slate-200" />
                  </div>

                  {/* Bottom Edge & Antenna accents */}
                  <div className="text-[10px] tracking-widest text-slate-500 uppercase font-mono font-semibold">
                    Titanium Pro
                  </div>

                  {/* Specular Light Reflection Overlay */}
                  <motion.div 
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 pointer-events-none"
                  />
                </div>
              </div>

              {/* Phone 2: Front Display View (Deep Violet / Cyan Glow Screen) */}
              <div className="absolute inset-0 rounded-[36px] bg-gradient-to-br from-indigo-300 via-cyan-400 to-slate-600 p-1 shadow-2xl border border-indigo-400/30 [transform:translateZ(-30px)_rotateY(180deg)]">
                <div className="w-full h-full rounded-[32px] bg-slate-950 relative overflow-hidden p-2 flex flex-col justify-between border border-slate-800">
                  
                  {/* Dynamic Island Notch */}
                  <div className="w-20 h-5 bg-black rounded-full mx-auto mt-1 flex items-center justify-end px-2 gap-1 border border-slate-800">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <div className="w-1 h-1 rounded-full bg-green-500 animate-ping" />
                  </div>

                  {/* Wallpaper Glowing Fluid Canvas */}
                  <div className="my-auto w-full h-44 rounded-2xl bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-3 relative overflow-hidden flex flex-col justify-between border border-indigo-500/30">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.3),transparent_70%)] animate-pulse" />
                    
                    <div className="relative z-10 flex justify-between items-start text-indigo-200 text-xs font-semibold">
                      <span>EthioMobile</span>
                      <span className="text-amber-400 font-bold">100% Verified</span>
                    </div>

                    <div className="relative z-10 text-center space-y-1 my-auto">
                      <div className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-cyan-300">
                        Live Auction
                      </div>
                      <div className="text-[10px] text-indigo-300/90 font-mono">
                        ETB 145,000 • Highest Bid
                      </div>
                    </div>

                    <div className="relative z-10 flex justify-between items-center text-[10px] text-slate-400">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
                        02h 15m left
                      </span>
                      <span className="flex items-center gap-1 text-emerald-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Active
                      </span>
                    </div>
                  </div>

                  {/* Home Bar */}
                  <div className="w-24 h-1 bg-slate-600 rounded-full mx-auto mb-1" />
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Video Upload / Custom Link Trigger Button (Admin only) */}
        {isAdmin && (
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="video/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700/80 shadow-lg backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="Upload custom hero video (Admin Only)"
            >
              <Upload className="h-3.5 w-3.5 text-amber-400" />
              <span>{customVideoUrl ? "Change Video File" : "Upload Video File"}</span>
            </button>
            {customVideoUrl && (
              <button
                onClick={handleRemoveVideo}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-red-950/80 hover:bg-red-900 text-xs font-semibold text-red-200 border border-red-800/80 shadow-lg backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                title="Reset to default 3D showcase"
              >
                <X className="h-3.5 w-3.5 text-red-400" />
                <span>Reset</span>
              </button>
            )}
          </div>
        )}

      </div>

      {/* Canvas Layer 2: Gradient Split & Background Pattern */}
      <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden" id="hero-effects-layer">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent lg:w-[65%]" id="hero-gradient-mask" />
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-[100px]" id="hero-ambient-glow" />
        <div className="absolute inset-y-0 left-0 w-full lg:w-[55%] bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] opacity-25" id="hero-dot-pattern" />
      </div>

      {/* Content Layer (Layer 3) */}
      <div className="relative z-20 max-w-xl px-6 sm:px-12 py-10 flex flex-col justify-center space-y-4 sm:space-y-5" id="hero-content">
        {/* Premium Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800/80 w-fit" id="hero-badge">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300">
            Ethiopia's Premium Mobile Marketplace
          </span>
        </div>

        {/* Headline with Gold-to-Amber gradient text */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-black tracking-tight leading-[1.1] text-white" id="hero-headline">
          Discover, Bid & Win{" "}
          <span className="block mt-1 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">
            Premium Smartphones
          </span>
        </h1>

        {/* Body Description */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md sm:max-w-lg font-medium" id="hero-description">
          The smart, safe, and transparent way to buy phones in Addis Ababa. Browse live listings from verified local shops, place bids, and complete payments securely in person.
        </p>

        {/* Feature Icons */}
        <div className="flex flex-wrap gap-4 pt-2" id="hero-features">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200" id="hero-feature-verified">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Verified Storefronts</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200" id="hero-feature-bidding">
            <Gavel className="h-4 w-4 text-amber-400 shrink-0" />
            <span>Live Local Bidding</span>
          </div>
        </div>
      </div>

    </div>
  );
}

