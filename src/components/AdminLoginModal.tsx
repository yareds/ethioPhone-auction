/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { useApp, checkIsAdmin, ADMIN_EMAILS } from "../context/AppContext";
import { UserRole } from "../types";
import { Shield, Lock, Mail, X, KeyRound, AlertCircle, ArrowLeft, CheckCircle2, Sparkles, Send } from "lucide-react";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AdminLoginModal({ isOpen, onClose, onSuccess }: AdminLoginModalProps) {
  const { currentUser, setActiveTab } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const isAdmin = currentUser.role === UserRole.ADMIN && currentUser.id !== "guest";

  const handleClose = () => {
    setErrorMsg("");
    setSuccessMsg("");
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
        return "Incorrect email or password. If you haven't set a password yet or use Google, please use 'Continue with Google' above.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/user-disabled":
        return "This administrator account has been disabled.";
      case "auth/too-many-requests":
        return "Too many failed login attempts. Please wait a moment or use Google Sign In.";
      case "auth/network-request-failed":
        return "Network connection error. Please check your internet connection.";
      case "auth/operation-not-allowed":
        return "Email/Password sign-in is disabled in Firebase Auth settings. Please use 'Continue with Google' to sign in as Admin.";
      case "auth/weak-password":
        return "Password must be at least 6 characters long.";
      default:
        return "Authentication failed. Please check your credentials or continue with Google.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setErrorMsg("Please enter your password.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    // Check if this email is an authorized admin
    const isAuthorized = checkIsAdmin(cleanEmail);
    if (!isAuthorized) {
      setErrorMsg(
        "This email is not in the administrator allowlist. Authorized administrators include yared.abegaz@gmail.com, admin@yonimobile.com, or admin@* addresses."
      );
      return;
    }

    setLoading(true);
    try {
      // 1. Try signing in first
      await signInWithEmailAndPassword(auth, cleanEmail, password);
      setEmail("");
      setPassword("");
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      const code = err?.code || "";
      // 2. If account does not exist or credentials invalid, try provisioning initial admin credentials
      if (code === "auth/invalid-credential" || code === "auth/user-not-found") {
        try {
          await createUserWithEmailAndPassword(auth, cleanEmail, password);
          setEmail("");
          setPassword("");
          if (onSuccess) {
            onSuccess();
          }
          onClose();
        } catch (createErr: any) {
          const createCode = createErr?.code || "";
          if (createCode === "auth/email-already-in-use") {
            // Account already exists in Firebase (e.g. registered via Google or existing password)
            setErrorMsg(
              cleanEmail.toLowerCase() === "yared.abegaz@gmail.com"
                ? "Incorrect password for this account. Since this account uses Google Sign-In, please click 'Continue with Google' above."
                : "Incorrect password for this administrator account. Please verify your password or use 'Forgot Password?' to reset it."
            );
          } else if (createCode === "auth/operation-not-allowed") {
            setErrorMsg(
              "Email/Password provider is disabled in Firebase Auth. Please use 'Continue with Google' to sign in as Admin."
            );
          } else if (createCode === "auth/weak-password") {
            setErrorMsg("Password must be at least 6 characters long.");
          } else {
            console.warn("Admin provision error:", createErr);
            setErrorMsg(getFriendlyErrorMessage(createCode));
          }
        }
      } else if (code === "auth/wrong-password") {
        setErrorMsg(
          cleanEmail.toLowerCase() === "yared.abegaz@gmail.com"
            ? "Incorrect password for this account. Since this account uses Google Sign-In, please click 'Continue with Google' above."
            : "Incorrect password for this administrator account. Please verify your password or use 'Forgot Password?' to reset it."
        );
      } else {
        console.warn("Admin sign in error:", err);
        setErrorMsg(getFriendlyErrorMessage(code));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMsg("Please enter your admin email above first, then click 'Forgot Password'.");
      return;
    }
    setErrorMsg("");
    setSuccessMsg("");
    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setSuccessMsg(`Password reset link sent to ${cleanEmail}! Check your inbox to set your password.`);
    } catch (err: any) {
      console.warn("Password reset error:", err);
      if (err?.code === "auth/user-not-found") {
        setErrorMsg("No account found for this email. Enter a password (min 6 chars) and click 'Sign In' to set it up.");
      } else {
        setErrorMsg(err?.message || "Could not send password reset email.");
      }
    } finally {
      setIsResetting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      console.error("Google sign in error:", err);
      if (err?.code === "auth/popup-closed-by-user") {
        setErrorMsg("Sign-in window was closed before completing.");
      } else if (err?.code === "auth/popup-blocked") {
        setErrorMsg("Sign-in popup was blocked by your browser. Please allow popups.");
      } else {
        setErrorMsg(err?.message || "Failed to sign in with Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleClose}
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

        {isAdmin ? (
          <div className="text-center py-2 space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-2xl p-4 text-xs font-semibold flex items-center gap-3 text-left">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-bold text-sm">Authenticated as Admin</p>
                <p className="opacity-90 font-normal mt-0.5">{currentUser.email || currentUser.name}</p>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveTab("admin");
                onClose();
              }}
              className="w-full bg-[var(--color-gold)] hover:brightness-110 text-[var(--color-ink)] font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer"
              id="admin-modal-enter-workspace-btn"
            >
              <Shield className="h-4 w-4" />
              <span>Enter Admin Workspace</span>
            </button>
          </div>
        ) : (
          <>
            {errorMsg && (
              <div className="mb-4 bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 text-[var(--color-danger)] rounded-xl p-3 text-xs font-semibold flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl p-3 text-xs font-semibold flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{successMsg}</span>
              </div>
            )}

            {/* Google Sign In option */}
            <div className="mb-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[var(--color-ink-soft)] hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-white text-xs font-bold transition-all shadow-xs hover:shadow-sm flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                id="admin-login-google-btn"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Continue with Google as Admin</span>
              </button>
              <p className="text-[10px] text-center text-gray-400 dark:text-gray-500 mt-1">
                Authorized for <span className="text-[var(--color-gold)] font-medium">yared.abegaz@gmail.com</span>
              </p>
            </div>

            <div className="relative flex py-1 items-center mb-4">
              <div className="flex-grow border-t border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)]"></div>
              <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-gray-400">or sign in with credentials</span>
              <div className="flex-grow border-t border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)]"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <Mail className="h-3 w-3 text-[var(--color-gold)]" /> Admin Email
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEmail("yared.abegaz@gmail.com")}
                      className="text-[10px] text-gray-400 hover:text-[var(--color-gold)] underline cursor-pointer"
                    >
                      yared
                    </button>
                    <span className="text-gray-300 dark:text-gray-600 text-[10px]">•</span>
                    <button
                      type="button"
                      onClick={() => setEmail("admin@yonimobile.com")}
                      className="text-[10px] text-gray-400 hover:text-[var(--color-gold)] underline cursor-pointer"
                    >
                      yonimobile
                    </button>
                  </div>
                </div>
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <Lock className="h-3 w-3 text-[var(--color-gold)]" /> Password
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={isResetting}
                    className="text-[10px] text-[var(--color-gold)] hover:underline cursor-pointer font-medium disabled:opacity-50"
                  >
                    {isResetting ? "Sending link..." : "Forgot Password?"}
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  className="w-full bg-[var(--color-paper-soft)] dark:bg-[var(--color-ink-soft)] border border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] focus:border-[var(--color-gold)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--color-ink)] dark:text-white font-medium outline-none transition-all"
                  id="admin-login-password-input"
                />
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                  New admin? Enter your desired password (min 6 characters) to initialize.
                </p>
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
                  <span>{loading ? "Authenticating..." : "Sign In / Setup"}</span>
                </button>
              </div>

              {/* Return to marketplace link */}
              <div className="pt-3 flex items-center justify-center border-t border-[var(--color-paper-soft)] dark:border-[var(--color-ink-soft)] text-[11px]">
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-gray-500 hover:text-[var(--color-gold)] dark:text-gray-400 transition-colors font-medium cursor-pointer inline-flex items-center gap-1.5 py-0.5"
                  id="admin-login-back-to-marketplace-btn"
                >
                  <ArrowLeft className="h-3 w-3" />
                  <span>Return to Marketplace</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
