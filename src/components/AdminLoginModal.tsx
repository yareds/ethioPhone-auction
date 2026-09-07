/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { Shield, Lock, Mail, X, KeyRound, AlertCircle, ArrowLeft } from "lucide-react";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AdminLoginModal({ isOpen, onClose, onSuccess }: AdminLoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleClose = () => {
    setErrorMsg("");
    setEmail("");
    setPassword("");
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const getFriendlyErrorMessage = (code: string) => {
    switch (code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Invalid email or password. Please check your credentials.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/user-disabled":
        return "This administrator account has been disabled.";
      case "auth/too-many-requests":
        return "Too many failed login attempts. Please try again later.";
      case "auth/network-request-failed":
        return "Network connection error. Please check your internet connection.";
      case "auth/operation-not-allowed":
        return "Email/Password sign-in is disabled in Firebase Auth. Please enable it in the Firebase Console.";
      default:
        return "Failed to sign in as Admin. Please check your email and password.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setErrorMsg("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setEmail("");
      setPassword("");
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      console.error("Admin login error:", err);
      const friendlyMsg = getFriendlyErrorMessage(err?.code || "");
      setErrorMsg(friendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-login-title"
    >
      <div
        className="relative w-full max-w-md bg-[var(--color-paper)] dark:bg-[var(--color-ink)] border border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] rounded-3xl p-6 sm:p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-[var(--color-paper-soft)] dark:hover:bg-[var(--color-ink-soft)] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]"
          id="admin-login-close-btn"
          aria-label="Close admin login modal"
          title="Close (Esc)"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="h-14 w-14 bg-[var(--color-gold)]/15 text-[var(--color-gold)] rounded-2xl flex items-center justify-center mx-auto mb-3 border border-[var(--color-gold)]/30 shadow-sm">
            <Shield className="h-7 w-7" />
          </div>
          <h3 id="admin-login-title" className="font-display font-black text-xl text-[var(--color-ink)] dark:text-white">
            Admin Access
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Sign in with authorized administrator credentials
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 text-[var(--color-danger)] rounded-xl p-3 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Mail className="h-3 w-3 text-[var(--color-gold)]" /> Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@yonimobile.com"
              required
              className="w-full bg-[var(--color-paper-soft)] dark:bg-[var(--color-ink-soft)] border border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] focus:border-[var(--color-gold)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--color-ink)] dark:text-white font-medium outline-none transition-all"
              id="admin-login-email-input"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Lock className="h-3 w-3 text-[var(--color-gold)]" /> Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-[var(--color-paper-soft)] dark:bg-[var(--color-ink-soft)] border border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] focus:border-[var(--color-gold)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--color-ink)] dark:text-white font-medium outline-none transition-all"
              id="admin-login-password-input"
            />
          </div>

          {/* Action Buttons: Cancel and Sign In */}
          <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="w-full sm:w-1/3 px-4 py-3 rounded-xl border border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] hover:bg-[var(--color-paper-soft)] dark:hover:bg-[var(--color-ink-soft)] text-[var(--color-ink)] dark:text-white text-xs font-bold transition-all text-center cursor-pointer disabled:opacity-50"
              id="admin-login-cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-2/3 bg-[var(--color-gold)] hover:brightness-110 text-[var(--color-ink)] font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              id="admin-login-submit-btn"
            >
              <KeyRound className="h-4 w-4" />
              <span>{loading ? "Authenticating..." : "Sign In"}</span>
            </button>
          </div>

          {/* Explicit return to marketplace text link */}
          <div className="pt-2 text-center border-t border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)]">
            <button
              type="button"
              onClick={handleClose}
              className="text-[11px] text-gray-500 hover:text-[var(--color-gold)] dark:text-gray-400 transition-colors font-medium cursor-pointer inline-flex items-center gap-1.5"
              id="admin-login-back-to-marketplace-btn"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Decided not to sign in? Return to Marketplace</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
