/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { PhoneListing, AuctionStatus, UserRole } from "../types";
import { useApp } from "../context/AppContext";
import {
  Clock,
  Calendar,
  X,
  Shield,
  CheckCircle2,
  AlertCircle,
  Play,
  StopCircle,
  Timer,
  Hourglass,
  ArrowRight,
  Sparkles,
  Zap
} from "lucide-react";

interface EditBidTimeFrameModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: PhoneListing;
}

export function toLocalDatetimeString(isoDateString: string): string {
  if (!isoDateString) return "";
  try {
    const d = new Date(isoDateString);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
  } catch {
    return "";
  }
}

export default function EditBidTimeFrameModal({
  isOpen,
  onClose,
  listing
}: EditBidTimeFrameModalProps) {
  const { currentUser, updateListing } = useApp();

  const [startInput, setStartInput] = useState("");
  const [endInput, setEndInput] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<AuctionStatus>(listing.status);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Initialize input values when listing changes or modal opens
  useEffect(() => {
    if (isOpen && listing) {
      setStartInput(toLocalDatetimeString(listing.startTime || new Date().toISOString()));
      setEndInput(toLocalDatetimeString(listing.endTime));
      setSelectedStatus(listing.status);
      setErrorMsg("");
      setSuccessMsg("");
    }
  }, [isOpen, listing]);

  if (!isOpen) return null;

  const isAdmin = currentUser.role === UserRole.ADMIN && currentUser.id !== "guest";

  const getComputedDuration = () => {
    if (!startInput || !endInput) return null;
    const s = new Date(startInput).getTime();
    const e = new Date(endInput).getTime();
    if (isNaN(s) || isNaN(e) || e <= s) return null;

    const diffMs = e - s;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const days = Math.floor(diffHours / 24);
    const remHours = diffHours % 24;
    const remMins = diffMins % 60;

    let parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (remHours > 0 || days > 0) parts.push(`${remHours}h`);
    parts.push(`${remMins}m`);
    return parts.join(" ");
  };

  const getTimeRemainingFromEnd = () => {
    if (!endInput) return null;
    const now = Date.now();
    const e = new Date(endInput).getTime();
    if (isNaN(e)) return null;

    const diffMs = e - now;
    if (diffMs <= 0) {
      const agoMins = Math.floor(Math.abs(diffMs) / (1000 * 60));
      if (agoMins < 60) return `Ended ${agoMins}m ago`;
      const agoHours = Math.floor(agoMins / 60);
      if (agoHours < 24) return `Ended ${agoHours}h ago`;
      return `Ended ${Math.floor(agoHours / 24)}d ago`;
    }

    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const days = Math.floor(diffHours / 24);
    const remHours = diffHours % 24;
    const remMins = diffMins % 60;

    if (days > 0) return `${days}d ${remHours}h remaining`;
    if (diffHours > 0) return `${diffHours}h ${remMins}m remaining`;
    return `${remMins}m remaining`;
  };

  // Helper to extend end time by minutes from current end time (or now if past)
  const handleExtendByMinutes = (minutesToAdd: number) => {
    setErrorMsg("");
    const now = Date.now();
    let baseTime = endInput ? new Date(endInput).getTime() : now;
    // If current end time was already in the past, start extension from right now
    if (isNaN(baseTime) || baseTime < now) {
      baseTime = now;
    }
    const newEnd = new Date(baseTime + minutesToAdd * 60 * 1000);
    setEndInput(toLocalDatetimeString(newEnd.toISOString()));

    // Automatically transition to LIVE if previously ended and new end time is in the future
    if (newEnd.getTime() > now && selectedStatus === AuctionStatus.ENDED) {
      setSelectedStatus(AuctionStatus.LIVE);
    }
  };

  // Quick preset: end in specific minutes from now
  const handleEndInMinutesFromNow = (minutes: number) => {
    setErrorMsg("");
    const now = new Date();
    const newEnd = new Date(now.getTime() + minutes * 60 * 1000);
    setEndInput(toLocalDatetimeString(newEnd.toISOString()));

    if (minutes <= 0) {
      setSelectedStatus(AuctionStatus.ENDED);
    } else if (selectedStatus === AuctionStatus.ENDED) {
      setSelectedStatus(AuctionStatus.LIVE);
    }
  };

  // Quick preset: set new schedule duration from right now
  const handleScheduleFromNow = (days: number) => {
    setErrorMsg("");
    const now = new Date();
    const newEnd = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    setStartInput(toLocalDatetimeString(now.toISOString()));
    setEndInput(toLocalDatetimeString(newEnd.toISOString()));
    setSelectedStatus(AuctionStatus.LIVE);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!isAdmin) {
      setErrorMsg("Administrator clearance is required to update bidding schedules.");
      return;
    }

    if (!startInput) {
      setErrorMsg("Please select an auction start date and time.");
      return;
    }

    if (!endInput) {
      setErrorMsg("Please select an auction end date and time.");
      return;
    }

    const startDate = new Date(startInput);
    const endDate = new Date(endInput);

    if (isNaN(startDate.getTime())) {
      setErrorMsg("Invalid start date and time format.");
      return;
    }

    if (isNaN(endDate.getTime())) {
      setErrorMsg("Invalid end date and time format.");
      return;
    }

    if (endDate.getTime() <= startDate.getTime()) {
      setErrorMsg("Auction end time must be after the start time.");
      return;
    }

    setIsSaving(true);

    try {
      const now = Date.now();
      let finalStatus = selectedStatus;

      // Smart status synchronization
      if (startDate.getTime() > now && finalStatus === AuctionStatus.LIVE) {
        finalStatus = AuctionStatus.UPCOMING;
      } else if (endDate.getTime() > now && startDate.getTime() <= now && finalStatus === AuctionStatus.ENDED) {
        finalStatus = AuctionStatus.LIVE;
      } else if (endDate.getTime() <= now && finalStatus === AuctionStatus.LIVE) {
        finalStatus = AuctionStatus.ENDED;
      }

      updateListing(listing.id, {
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        status: finalStatus
      });

      setSuccessMsg("Auction bid time frame successfully updated!");
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to update bidding time frame.");
    } finally {
      setIsSaving(false);
    }
  };

  const durationStr = getComputedDuration();
  const remainingStr = getTimeRemainingFromEnd();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-[var(--color-ink)] text-gray-900 dark:text-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/40">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-[var(--color-gold)]/10 text-[var(--color-gold)] flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <span>Edit Bid Time Frame</span>
                <span className="text-[10px] bg-[var(--color-gold)]/20 text-[var(--color-gold)] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Admin Control
                </span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Modify auction start & end dates, extend duration, or conclude bidding
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            id="close-bid-time-frame-modal-btn"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Device Information Summary */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/20">
          <div className="flex items-center gap-3.5">
            <img
              src={listing.images[0] || "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=200&auto=format&fit=crop&q=80"}
              alt={listing.model}
              className="h-14 w-14 rounded-xl object-cover border border-gray-200 dark:border-gray-800 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-[var(--color-gold)] uppercase tracking-wider">
                  {listing.brand}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  listing.status === AuctionStatus.LIVE
                    ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400 animate-pulse"
                    : listing.status === AuctionStatus.UPCOMING
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                }`}>
                  {listing.status}
                </span>
              </div>
              <h4 className="text-sm font-bold truncate text-gray-900 dark:text-white">
                {listing.model} ({listing.storage}, {listing.condition})
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2">
                <span>Current Bid: <strong className="text-gray-900 dark:text-white font-mono">ETB {listing.currentBid.toLocaleString()}</strong></span>
                {remainingStr && (
                  <span className="text-[11px] font-medium text-[var(--color-gold)]">
                    • {remainingStr}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-5">
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs rounded-2xl p-3 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-2xl p-3 flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-semibold">{successMsg}</span>
            </div>
          )}

          {/* Start & End Date Time Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-[var(--color-gold)]" /> Auction Start Time
                </label>
                <button
                  type="button"
                  onClick={() => setStartInput(toLocalDatetimeString(new Date().toISOString()))}
                  className="text-[10px] text-[var(--color-gold)] hover:underline font-semibold cursor-pointer"
                >
                  Set Now
                </button>
              </div>
              <input
                type="datetime-local"
                value={startInput}
                onChange={(e) => setStartInput(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white font-medium focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] transition-all"
                required
                id="edit-auction-start-time-input"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[var(--color-gold)]" /> Auction End Time
                </label>
                {durationStr && (
                  <span className="text-[10px] text-gray-500 font-medium">
                    Duration: {durationStr}
                  </span>
                )}
              </div>
              <input
                type="datetime-local"
                value={endInput}
                onChange={(e) => setEndInput(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white font-medium focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] transition-all"
                required
                id="edit-auction-end-time-input"
              />
            </div>
          </div>

          {/* Quick Extension Presets */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-[var(--color-gold)]" /> Quick Extend Bidding
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              <button
                type="button"
                onClick={() => handleExtendByMinutes(30)}
                className="py-2 px-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold rounded-xl transition-all cursor-pointer text-center"
              >
                +30m
              </button>
              <button
                type="button"
                onClick={() => handleExtendByMinutes(60)}
                className="py-2 px-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold rounded-xl transition-all cursor-pointer text-center"
              >
                +1 Hour
              </button>
              <button
                type="button"
                onClick={() => handleExtendByMinutes(360)}
                className="py-2 px-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold rounded-xl transition-all cursor-pointer text-center"
              >
                +6 Hours
              </button>
              <button
                type="button"
                onClick={() => handleExtendByMinutes(720)}
                className="py-2 px-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold rounded-xl transition-all cursor-pointer text-center"
              >
                +12 Hours
              </button>
              <button
                type="button"
                onClick={() => handleExtendByMinutes(1440)}
                className="py-2 px-2 bg-[var(--color-gold)]/15 hover:bg-[var(--color-gold)]/25 text-[var(--color-gold)] font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
              >
                +1 Day
              </button>
              <button
                type="button"
                onClick={() => handleExtendByMinutes(4320)}
                className="py-2 px-2 bg-[var(--color-gold)]/15 hover:bg-[var(--color-gold)]/25 text-[var(--color-gold)] font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
              >
                +3 Days
              </button>
            </div>
          </div>

          {/* Quick Schedule & Shorten Presets */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Hourglass className="h-3.5 w-3.5 text-blue-500" /> Fast Reset / Conclude
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleScheduleFromNow(1)}
                className="py-1.5 px-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-xl font-medium transition-all cursor-pointer"
              >
                Reset to 24h from Now
              </button>
              <button
                type="button"
                onClick={() => handleScheduleFromNow(3)}
                className="py-1.5 px-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-xl font-medium transition-all cursor-pointer"
              >
                Reset to 3 Days from Now
              </button>
              <button
                type="button"
                onClick={() => handleEndInMinutesFromNow(10)}
                className="py-1.5 px-3 bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs rounded-xl font-semibold transition-all cursor-pointer"
              >
                End in 10 Minutes
              </button>
              <button
                type="button"
                onClick={() => handleEndInMinutesFromNow(0)}
                className="py-1.5 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs rounded-xl font-semibold transition-all cursor-pointer"
              >
                Conclude & End Now
              </button>
            </div>
          </div>

          {/* Status Override */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-[var(--color-gold)]" /> Auction Status State
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as AuctionStatus)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white font-medium focus:outline-none focus:border-[var(--color-gold)] transition-all cursor-pointer"
              id="edit-auction-status-select"
            >
              <option value={AuctionStatus.LIVE}>Live (Active Bidding)</option>
              <option value={AuctionStatus.UPCOMING}>Upcoming (Scheduled)</option>
              <option value={AuctionStatus.ENDED}>Ended (Bidding Closed)</option>
              <option value={AuctionStatus.COMPLETED}>Completed (Pickup Verified)</option>
            </select>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
              Extending an ended auction past current time automatically reactivates status to Live.
            </p>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer"
              id="cancel-bid-time-frame-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-[var(--color-gold)] hover:brightness-110 text-gray-950 text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
              id="save-bid-time-frame-btn"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isSaving ? "Saving Schedule..." : "Save Time Frame"}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
