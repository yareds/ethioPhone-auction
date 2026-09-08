/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { useApp } from "../context/AppContext";
import { UserRole } from "../types";
import { TRIAL_MODE } from "../config";
import {
  Smartphone,
  Shield,
  User,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Info,
  X,
  Sparkles,
  Clock,
  ArrowRight
} from "lucide-react";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignupSuccess?: () => void;
  context?: string;
}

export default function SignupModal({
  isOpen,
  onClose,
  onSignupSuccess,
  context
}: SignupModalProps) {
  const { signupUser } = useApp();

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subCity, setSubCity] = useState("Bole");
  const [role] = useState<UserRole>(UserRole.BUYER);
  const [address, setAddress] = useState("");
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);

  if (!isOpen) return null;

  if (TRIAL_MODE) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-md bg-[var(--color-paper)] dark:bg-[var(--color-ink)] border border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-[var(--color-paper-soft)] dark:hover:bg-[var(--color-ink-soft)] transition-all cursor-pointer"
            id="trial-modal-close-btn"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="h-16 w-16 bg-[var(--color-gold)]/15 text-[var(--color-gold)] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[var(--color-gold)]/30 shadow-sm">
            <Clock className="h-8 w-8" />
          </div>

          <h3 className="font-display font-black text-xl text-[var(--color-ink)] dark:text-white">
            Bidding Opens Soon
          </h3>

          <p className="text-sm font-bold text-[var(--color-gold)] mt-2">
            Bidding opens soon — check back shortly
          </p>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2.5 leading-relaxed font-medium">
            YONIMobile Auction is currently preparing listings for live bidding.
          </p>

          <button
            onClick={onClose}
            className="mt-6 w-full bg-[var(--color-gold)] hover:brightness-110 text-[var(--color-ink)] font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            id="trial-modal-confirm-btn"
          >
            Got it
          </button>
        </div>
      </div>
    );
  }

  const handleGoogleSignIn = async () => {
    setErrorMsg("");
    setGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onSignupSuccess) {
          onSignupSuccess();
        }
      }, 700);
    } catch (err: any) {
      console.error("Google sign in error:", err);
      if (err?.code === "auth/popup-closed-by-user") {
        setErrorMsg("Sign-in window closed before completing.");
      } else if (err?.code === "auth/popup-blocked") {
        setErrorMsg("Sign-in popup was blocked by browser. Please allow popups.");
      } else {
        setErrorMsg(err?.message || "Failed to sign in with Google.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Please provide your Full Name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!phone.trim()) {
      setErrorMsg("Please provide a phone number for CBE Birr / Telebirr transfers.");
      return;
    }

    try {
      signupUser({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        location: {
          region: "Addis Ababa",
          city: "Addis Ababa",
          subCity: subCity,
          address: address.trim() || `${subCity} Central Area`
        },
        role: role
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onSignupSuccess) {
          onSignupSuccess();
        }
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during profile registration.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[var(--color-paper)] dark:bg-[var(--color-ink)] border border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] rounded-3xl p-6 sm:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-[var(--color-paper-soft)] dark:hover:bg-[var(--color-ink-soft)] transition-all cursor-pointer"
          id="signup-modal-close-btn"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {success ? (
          <div className="py-10 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200" id="signup-success-container">
            <div className="h-20 w-20 bg-[var(--color-verified-soft)] text-[var(--color-verified)] rounded-full flex items-center justify-center mx-auto text-4xl">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <div>
              <h3 className="font-display font-black text-2xl text-[var(--color-ink)] dark:text-white">Account Ready!</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 leading-relaxed">
                You are now signed in. Continuing to live auction...
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            
            {/* Header */}
            <div>
              <div className="flex items-center gap-2.5">
                <span className="bg-[var(--color-gold)] text-[var(--color-ink)] p-2.5 rounded-2xl shadow-sm inline-flex">
                  <Smartphone className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-display font-black text-xl sm:text-2xl text-[var(--color-ink)] dark:text-white">
                    Bidder Sign In & Account
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Sign in to place live bids, track winning phones, and manage your watchlist.
                  </p>
                </div>
              </div>
            </div>

            {/* Context Notice Banner */}
            {context && (
              <div className="bg-[var(--color-gold)]/15 border border-[var(--color-gold)]/40 text-[var(--color-ink)] dark:text-white rounded-2xl p-3.5 flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-[var(--color-gold)] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-[var(--color-gold)] uppercase tracking-wider">Required Action</p>
                  <p className="text-xs font-semibold mt-0.5">{context}</p>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 text-[var(--color-danger)] rounded-xl p-3 text-xs font-semibold flex items-center gap-1.5">
                <span>⚠️</span> {errorMsg}
              </div>
            )}

            {/* Primary Action: Sign in with Google */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full py-3.5 px-4 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[var(--color-ink-soft)] hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-white text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-3 cursor-pointer shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-50"
                id="bidder-google-signin-btn"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{googleLoading ? "Signing in with Google..." : "Sign in with Google"}</span>
              </button>

              <div className="flex items-center gap-3 py-1">
                <div className="h-px bg-[var(--color-paper-soft)] dark:bg-[var(--color-ink-soft)] flex-1" />
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  or register with phone
                </span>
                <div className="h-px bg-[var(--color-paper-soft)] dark:bg-[var(--color-ink-soft)] flex-1" />
              </div>
            </div>

            {/* Collapsible Manual Registration Form */}
            {!showManualForm ? (
              <button
                type="button"
                onClick={() => setShowManualForm(true)}
                className="w-full py-2.5 px-4 text-xs font-semibold text-gray-500 hover:text-[var(--color-gold)] dark:text-gray-400 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 hover:border-[var(--color-gold)] transition-all text-center cursor-pointer"
                id="bidder-show-manual-form-btn"
              >
                Prefer to register with phone & sub-city manually? Click here
              </button>
            ) : (
              <form onSubmit={handleManualSubmit} className="space-y-3 pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <User className="h-3.5 w-3.5" /> Full Name / Nickname
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Abebe Balcha"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs bg-[var(--color-paper-soft)] dark:bg-[var(--color-ink-soft)] border border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] text-[var(--color-ink)] dark:text-white font-medium placeholder-gray-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" /> Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. abebe@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs bg-[var(--color-paper-soft)] dark:bg-[var(--color-ink-soft)] border border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] text-[var(--color-ink)] dark:text-white font-medium placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" /> Mobile (Telebirr/CBE active)
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +251 911 22 33 44"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs bg-[var(--color-paper-soft)] dark:bg-[var(--color-ink-soft)] border border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] text-[var(--color-ink)] dark:text-white font-mono font-medium placeholder-gray-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> Addis Sub-City
                    </label>
                    <select
                      value={subCity}
                      onChange={(e) => setSubCity(e.target.value)}
                      className="w-full text-xs bg-[var(--color-paper-soft)] dark:bg-[var(--color-ink-soft)] border border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] text-[var(--color-ink)] dark:text-white font-medium cursor-pointer"
                    >
                      <option value="Bole">Bole</option>
                      <option value="Kirkos">Kirkos</option>
                      <option value="Yeka">Yeka</option>
                      <option value="Arada">Arada</option>
                      <option value="Lideta">Lideta</option>
                      <option value="Nifas Silk">Nifas Silk</option>
                      <option value="Kolfe">Kolfe Keranio</option>
                      <option value="Gullele">Gullele</option>
                      <option value="Akaki">Akaki Kality</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      📍 Specific Area (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bole Medhanialem"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full text-xs bg-[var(--color-paper-soft)] dark:bg-[var(--color-ink-soft)] border border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] text-[var(--color-ink)] dark:text-white font-medium placeholder-gray-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[var(--color-gold)] hover:brightness-110 text-[var(--color-ink)] font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  id="signup-modal-submit-btn"
                >
                  Create Bidder Profile & Continue
                </button>
              </form>
            )}

            {/* Handshake Info Banner */}
            <div className="bg-[var(--color-paper-soft)] dark:bg-[var(--color-ink-soft)] rounded-2xl p-4 border border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-sans font-bold text-xs text-[var(--color-gold)] tracking-wider flex items-center gap-1.5 uppercase">
                  <Shield className="h-4 w-4" /> Addis Handshake System
                </span>
                <span className="text-[10px] text-gray-400 font-semibold">100% Secure</span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                Win an auction, inspect the physical device at verified shops in Bole, and verify IMEI status before transferring funds.
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
