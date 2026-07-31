/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { PhoneListing, AuctionStatus, PhoneCondition } from "../types";
import { Heart, Clock, Gavel, MapPin, Eye, CheckCircle, ShieldAlert } from "lucide-react";

export default function AuctionCard({ listing, onViewDetails }: { listing: PhoneListing; onViewDetails: (listing: PhoneListing) => void; key?: string }) {
  const { bids, watchlist, toggleWatchlist, shops } = useApp();
  const [timeLeft, setTimeLeft] = useState("");
  const [isLive, setIsLive] = useState(false);
  const [isUpcoming, setIsUpcoming] = useState(false);

  const listingBids = bids.filter((b) => b.listingId === listing.id);
  const bidCount = listingBids.length;
  const isWatched = watchlist.includes(listing.id);

  // Shop details if applicable
  const associatedShop = listing.shopId ? shops.find((s) => s.id === listing.shopId) : null;

  // Render condition badge nicely
  const getConditionLabel = (cond: PhoneCondition) => {
    switch (cond) {
      case PhoneCondition.NEW: return "Brand New";
      case PhoneCondition.EXCELLENT: return "Excellent";
      case PhoneCondition.VERY_GOOD: return "Very Good";
      case PhoneCondition.GOOD: return "Good";
      case PhoneCondition.FAIR: return "Fair";
      default: return cond;
    }
  };

  const getConditionStyle = (cond: PhoneCondition) => {
    switch (cond) {
      case PhoneCondition.NEW: return "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 border border-green-200 dark:border-green-900";
      case PhoneCondition.EXCELLENT: return "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-900";
      case PhoneCondition.VERY_GOOD: return "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200 dark:border-purple-900";
      case PhoneCondition.GOOD: return "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 border border-orange-200 dark:border-orange-900";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700";
    }
  };

  // Real-time ticking countdown
  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const start = new Date(listing.startTime).getTime();
      const end = new Date(listing.endTime).getTime();

      if (listing.status === AuctionStatus.COMPLETED) {
        setTimeLeft("Pickup Completed");
        setIsLive(false);
        setIsUpcoming(false);
        return;
      }

      if (now < start) {
        setIsUpcoming(true);
        setIsLive(false);
        const diff = start - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 24) {
          setTimeLeft(`Starts in ${Math.ceil(hours / 24)}d`);
        } else {
          setTimeLeft(`Starts in ${hours}h ${mins}m`);
        }
      } else if (now >= start && now < end) {
        setIsLive(true);
        setIsUpcoming(false);
        const diff = end - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        if (hours > 24) {
          setTimeLeft(`${Math.floor(hours / 24)}d ${hours % 24}h`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${mins}m ${secs}s`);
        } else {
          setTimeLeft(`${mins}m ${secs}s`);
        }
      } else {
        setIsLive(false);
        setIsUpcoming(false);
        setTimeLeft("Ended");
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [listing]);

  // Determine trust indicators
  const trustScore = () => {
    let score = 50;
    if (listing.isImeiVerified) score += 20;
    if (associatedShop?.isVerified) score += 20;
    if (listing.batteryHealth > 90) score += 10;
    return Math.min(score, 100);
  };

  return (
    <div className="group flex flex-col bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-yellow-400 dark:hover:border-yellow-500 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative">
      
      {/* Watchlist toggle button */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleWatchlist(listing.id); }}
        className={`absolute top-4 right-4 z-10 p-2 rounded-full border shadow-sm transition-all ${
          isWatched
            ? "bg-red-500 border-red-500 text-white hover:scale-110"
            : "bg-white/80 dark:bg-gray-900/80 border-gray-150 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-900 hover:scale-110"
        }`}
        id={`watchlist-toggle-${listing.id}`}
        title={isWatched ? "Remove from Watchlist" : "Add to Watchlist"}
      >
        <Heart className={`h-4.5 w-4.5 ${isWatched ? "fill-current" : ""}`} />
      </button>

      {/* Featured / Live Ribbon */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
        {listing.isFeatured && (
          <span className="bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-900 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 uppercase tracking-wider">
            ⭐ Featured
          </span>
        )}
        {isLive && (
          <span className="bg-red-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 uppercase tracking-wider animate-pulse">
            🔴 Live
          </span>
        )}
        {isUpcoming && (
          <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 uppercase tracking-wider">
            📅 Upcoming
          </span>
        )}
        {listing.status === AuctionStatus.ENDED && (
          <span className="bg-gray-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 uppercase tracking-wider">
            🏁 Ended
          </span>
        )}
        {listing.status === AuctionStatus.COMPLETED && (
          <span className="bg-green-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 uppercase tracking-wider">
            🤝 Completed
          </span>
        )}
      </div>

      {/* Image container */}
      <div className="h-56 w-full overflow-hidden relative bg-gray-100 dark:bg-gray-950 cursor-pointer" onClick={() => onViewDetails(listing)}>
        <img
          src={listing.images[0] || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80"}
          alt={`${listing.brand} ${listing.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
          <p className="text-[10px] text-gray-200 font-medium tracking-wide">
            Views: {listing.views} • Battery: {listing.batteryHealth}% BH
          </p>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        
        {/* Header Title */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${getConditionStyle(listing.condition)}`}>
              {getConditionLabel(listing.condition)}
            </span>
            <span className="text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-md">
              {listing.storage} / {listing.ram}
            </span>
          </div>

          <h3
            onClick={() => onViewDetails(listing)}
            className="font-sans font-extrabold text-base text-gray-900 dark:text-white line-clamp-1 hover:text-yellow-500 cursor-pointer transition-colors"
          >
            {listing.brand} {listing.model}
          </h3>

          {/* Shop information / Verification indicator */}
          <div className="flex items-center gap-1.5 mt-1">
            {associatedShop ? (
              <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-0.5">
                <CheckCircle className="h-3 w-3 fill-current text-white dark:text-gray-900" />
                {associatedShop.name}
              </span>
            ) : (
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-0.5">
                Individual Seller
              </span>
            )}
            {listing.isImeiVerified && (
              <span className="text-[9px] bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 px-1.5 py-0.5 rounded font-bold">
                IMEI VERIFIED
              </span>
            )}
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-2 leading-relaxed">
            {listing.conditionDetails}
          </p>
        </div>

        {/* Pricing, Bids & Timer */}
        <div className="mt-5 pt-4 border-t border-gray-50 dark:border-gray-800/60">
          
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-bold">Current Bid</p>
              <p className="text-lg font-black text-gray-900 dark:text-white">
                ETB {listing.currentBid.toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">
                {bidCount} {bidCount === 1 ? "bid" : "bids"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-bold flex items-center gap-1 justify-end">
                <Clock className="h-3 w-3 text-gray-400" /> Time Left
              </p>
              <p className={`text-sm font-extrabold ${isLive ? "text-red-500" : isUpcoming ? "text-blue-500" : "text-gray-400"}`}>
                {timeLeft}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">
                {associatedShop?.location.subCity || "Addis Ababa"}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => onViewDetails(listing)}
            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              isLive
                ? "bg-yellow-400 hover:bg-yellow-500 text-slate-900 shadow-md shadow-yellow-400/10"
                : isUpcoming
                ? "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                : "bg-gray-50 dark:bg-gray-800/40 text-gray-400 cursor-not-allowed border border-gray-100 dark:border-gray-800"
            }`}
            id={`view-detail-${listing.id}`}
          >
            <Gavel className="h-3.5 w-3.5" />
            {isLive ? "Place Bid Now" : isUpcoming ? "Preview Auction" : "View Results"}
          </button>

        </div>

      </div>

    </div>
  );
}
