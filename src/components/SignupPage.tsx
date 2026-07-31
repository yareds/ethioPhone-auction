/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { UserRole } from "../types";
import { Smartphone, Shield, User, Mail, Phone, MapPin, CheckCircle2, Building, Info, HelpCircle } from "lucide-react";

interface SignupPageProps {
  onSignupSuccess: () => void;
}

export default function SignupPage({ onSignupSuccess }: SignupPageProps) {
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

    // Call Context signup helper
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
        onSignupSuccess();
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during profile registration.");
    }
  };

  if (success) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-in fade-in zoom-in-95 duration-200" id="signup-success-container">
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-3xl p-12 shadow-2xl max-w-lg mx-auto space-y-6">
          <div className="h-20 w-20 bg-green-100 dark:bg-green-950/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto text-4xl animate-bounce">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <div>
            <h3 className="font-sans font-black text-2xl text-gray-950 dark:text-white">Profile Registered!</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 leading-relaxed">
              Your high-trust digital wallet profile has been synchronized. You are now logged in and ready to trade!
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-4 text-[11px] text-gray-400 leading-normal">
            Redirecting to the EthioPhone live auction floor...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 animate-in fade-in duration-200" id="signup-page-container">
      
      {/* Title Header */}
      <div className="mb-8 text-center sm:text-left">
        <h1 className="font-sans font-black text-2xl sm:text-3xl text-gray-900 dark:text-white flex items-center justify-center sm:justify-start gap-2.5">
          <span className="bg-yellow-400 dark:bg-yellow-500 text-slate-900 p-2 rounded-2xl shadow-sm inline-flex">
            <Smartphone className="h-6 w-6" />
          </span>
          Create Virtual Profile
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1.5 max-w-2xl">
          Join Addis Ababa's premium smartphone marketplace. List verified devices, place active bids, and handle transactions securely.
        </p>
      </div>

      {/* Grid Layout (2 columns on desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Editorial Trust Guidelines (5 columns) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Trust Banner */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-lg relative overflow-hidden space-y-4">
            <div className="absolute right-0 top-0 h-32 w-32 bg-yellow-400/5 rounded-full blur-2xl pointer-events-none"></div>
            <h3 className="font-sans font-extrabold text-sm uppercase text-yellow-400 tracking-wider flex items-center gap-2">
              <Shield className="h-5 w-5" /> Handshake Guarantee
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              We operate under a physical verification framework. Every winner gets to inspect the smartphone physically at physical Bole shops before finalizing funds.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 font-bold shrink-0">✓</span>
                <span>No upfront bank or credit card deposits required.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 font-bold shrink-0">✓</span>
                <span>Instant 6-digit secure pickup codes generated on wins.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 font-bold shrink-0">✓</span>
                <span>Full Telebirr, CBE Birr, and physical cash support.</span>
              </li>
            </ul>
          </div>

          {/* CBE & Telebirr Notice */}
          <div className="bg-yellow-500/5 dark:bg-yellow-500/10 rounded-3xl p-5 border border-yellow-400/20 space-y-2 text-xs">
            <p className="font-extrabold text-yellow-800 dark:text-yellow-400 flex items-center gap-1.5">
              <Info className="h-4.5 w-4.5 shrink-0" /> Mobile Transfer System
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Your registered mobile number acts as your official escrow identifier. It is verified inside merchant physical locations to authorize safe, direct transfers.
            </p>
          </div>

          {/* Safety Procedures Card */}
          <div className="border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-3xl p-6 space-y-4 shadow-sm">
            <h4 className="font-sans font-extrabold text-xs text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4" /> Bidding Instructions
            </h4>
            <div className="space-y-3.5 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              <p>
                <strong>1. Bid Responsibility:</strong> When placing a bid, you agree to inspect and purchase the smartphone if you finish as the highest bidder.
              </p>
              <p>
                <strong>2. Communication:</strong> Direct shop chats will instantly activate upon your bids, keeping you updated with instant seller replies.
              </p>
            </div>
          </div>

        </div>

        {/* Right Side: The Sign-up Form (7 columns) */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-900 rounded-3xl border border-gray-150 dark:border-gray-800 p-6 sm:p-8 shadow-sm space-y-6">
          
          <div>
            <h2 className="font-sans font-extrabold text-lg text-gray-950 dark:text-white">Profile Registration</h2>
            <p className="text-xs text-gray-500 mt-1">Please enter your credentials. All virtual fields will immediately synchronize.</p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-xl p-3 text-xs font-semibold flex items-center gap-1.5">
              <span>⚠️</span> {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <User className="h-3.5 w-3.5" /> Full Name / Shop Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Abebe Balcha"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-750 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-900 dark:text-white font-medium placeholder-gray-400"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" /> Email Address
              </label>
              <input
                type="email"
                required
                placeholder="e.g. abebe@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-750 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-900 dark:text-white font-medium placeholder-gray-400"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" /> Mobile Number (Telebirr/CBE active)
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. +251 911 22 33 44"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-750 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-900 dark:text-white font-mono font-medium placeholder-gray-400"
              />
            </div>

            {/* Sub-city Selector (Addis Ababa only) */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> Addis Sub-City
              </label>
              <select
                value={subCity}
                onChange={(e) => setSubCity(e.target.value)}
                className="w-full text-xs bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-750 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-900 dark:text-white font-medium"
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

            {/* Physical Address */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                📍 Street / Mall Address (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Bole Olympia, Sunshine Building Shop #15"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full text-xs bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-750 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-900 dark:text-white font-medium placeholder-gray-400"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-extrabold py-4 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 mt-2 shadow-md hover:scale-[1.01] active:scale-[0.99]"
              id="signup-page-submit-btn"
            >
              Register & Join Live Auctions
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
