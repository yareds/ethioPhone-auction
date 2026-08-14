/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
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
  Clock
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
  const [role, setRole] = useState<UserRole>(UserRole.BUYER);
  const [address, setAddress] = useState("");
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  if (TRIAL_MODE) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-md bg-[var(--color-paper)] dark:bg-[var(--color-ink)] border border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-[var(--color-paper-soft)] dark:hover:bg-[var(--color-ink-soft)] transition-all"
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
            YONIMobile Auction is currently in a private trial mode. Public buyer registration and live bidding will be enabled shortly.
          </p>

          <button
            onClick={onClose}
            className="mt-6 w-full bg-[var(--color-gold)] hover:brightness-110 text-[var(--color-ink)] font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 shadow-md hover:scale-[1.01] active:scale-[0.99]"
            id="trial-modal-confirm-btn"
          >
            Got it
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Please provide your Full Name or Shop Name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!phone.trim()) {
      setErrorMsg("Please provide a phone number for CBE Birr/Telebirr transfers.");
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
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during profile registration.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[var(--color-paper)] dark:bg-[var(--color-ink)] border border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] rounded-3xl p-6 sm:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-[var(--color-paper-soft)] dark:hover:bg-[var(--color-ink-soft)] transition-all"
          id="signup-modal-close-btn"
        >
          <X className="h-5 w-5" />
        </button>

        {success ? (
          <div className="py-8 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200" id="signup-success-container">
            <div className="h-20 w-20 bg-[var(--color-verified-soft)] text-[var(--color-verified)] rounded-full flex items-center justify-center mx-auto text-4xl animate-bounce">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <div>
              <h3 className="font-display font-black text-2xl text-[var(--color-ink)] dark:text-white">Profile Registered!</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 leading-relaxed">
                Your high-trust digital profile has been created. Continuing your action...
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Header */}
            <div>
              <div className="flex items-center gap-2.5">
                <span className="bg-[var(--color-gold)] text-[var(--color-ink)] p-2 rounded-2xl shadow-sm inline-flex">
                  <Smartphone className="h-5 w-5" />
                </span>
                <h2 className="font-display font-black text-xl sm:text-2xl text-[var(--color-ink)] dark:text-white">
                  Create Virtual Profile
                </h2>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Quick 1-step registration to bid, buy, or save listings in Addis Ababa's smartphone marketplace.
              </p>
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
              <div className="bg-[var(--color-paper-soft)] border border-[var(--color-danger)]/30 text-[var(--color-danger)] rounded-xl p-3 text-xs font-semibold flex items-center gap-1.5">
                <span>⚠️</span> {errorMsg}
              </div>
            )}

            {/* Two Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* Form (7 cols) */}
              <div className="md:col-span-7 space-y-4">
                
                <form onSubmit={handleSubmit} className="space-y-3.5">
                
                {/* Full Name */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <User className="h-3.5 w-3.5" /> Full Name / Shop Name
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

                {/* Email */}
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

                {/* Phone Number */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> Mobile Number (Telebirr/CBE active)
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

                {/* Sub-city */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> Addis Sub-City
                  </label>
                  <select
                    value={subCity}
                    onChange={(e) => setSubCity(e.target.value)}
                    className="w-full text-xs bg-[var(--color-paper-soft)] dark:bg-[var(--color-ink-soft)] border border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] text-[var(--color-ink)] dark:text-white font-medium"
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

                {/* Address */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    📍 Address (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bole Olympia, Sunshine Bldg Shop #15"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full text-xs bg-[var(--color-paper-soft)] dark:bg-[var(--color-ink-soft)] border border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] text-[var(--color-ink)] dark:text-white font-medium placeholder-gray-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[var(--color-gold)] hover:brightness-110 text-[var(--color-ink)] font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 mt-2 shadow-md hover:scale-[1.01] active:scale-[0.99]"
                  id="signup-modal-submit-btn"
                >
                  Register & Continue
                </button>
              </form>
            </div>

              {/* Handshake Info (5 cols) */}
              <div className="md:col-span-5 space-y-3.5 text-xs">
                <div className="bg-[var(--color-ink)] text-white rounded-2xl p-4 border border-[var(--color-ink-soft)] space-y-2.5">
                  <h3 className="font-sans font-extrabold text-xs uppercase text-[var(--color-gold)] tracking-wider flex items-center gap-1.5">
                    <Shield className="h-4 w-4" /> Handshake Guarantee
                  </h3>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Physical storefront checkups in Bole before exchanging funds.
                  </p>
                  <ul className="space-y-1.5 text-[11px] text-slate-400">
                    <li className="flex items-center gap-1.5">
                      <span className="text-[var(--color-gold)] font-bold">✓</span> No credit card required
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-[var(--color-gold)] font-bold">✓</span> 6-digit pickup code
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-[var(--color-gold)] font-bold">✓</span> Telebirr & CBE Birr ready
                    </li>
                  </ul>
                </div>

                <div className="bg-[var(--color-paper-soft)] dark:bg-[var(--color-ink-soft)] rounded-2xl p-3.5 text-[11px] text-gray-600 dark:text-gray-400 space-y-1">
                  <p className="font-bold text-[var(--color-gold)] flex items-center gap-1">
                    <Info className="h-3.5 w-3.5" /> Instant Activation
                  </p>
                  <p className="leading-normal">
                    Your profile activates immediately. Your pending bid or watchlist item will process automatically right after.
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
