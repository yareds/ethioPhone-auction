/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { ShopProfile, PhoneListing, AuctionStatus, UserRole } from "../types";
import { X, CheckCircle, MapPin, Phone, Star, MessageSquare, Award, ArrowLeft, Heart, ShoppingBag } from "lucide-react";

export default function ShopProfileView({ shopId, onClose, onViewListing }: { shopId: string; onClose: () => void; onViewListing: (listing: PhoneListing) => void }) {
  const {
    shops,
    listings,
    addShopReview,
    currentUser
  } = useApp();

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const shop = shops.find((s) => s.id === shopId);
  if (!shop) return null;

  // Find active listings for this shop
  const shopListings = listings.filter((l) => l.shopId === shop.id && l.status === AuctionStatus.LIVE);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    addShopReview(shop.id, reviewRating, reviewComment.trim());
    setReviewComment("");
    setReviewRating(5);
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      
      {/* Back navigation button */}
      <button
        onClick={onClose}
        className="mb-6 flex items-center gap-1.5 text-xs font-extrabold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 transition-all shadow-sm"
        id="shop-back-btn"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Auctions
      </button>

      {/* Shop profile Banner/Logo Header */}
      <div className={`bg-gradient-to-r ${shop.bannerColor || "from-blue-600 to-indigo-800"} text-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl relative overflow-hidden mb-8`}>
        <div className="absolute right-0 bottom-0 h-40 w-40 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative">
          <img
            src={shop.logoUrl}
            alt={shop.name}
            className="h-20 w-20 sm:h-24 sm:w-24 rounded-3xl object-cover bg-white border-2 border-white/40 shadow-lg"
          />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-sans font-black text-2xl sm:text-3xl tracking-tight flex items-center gap-2">
                {shop.name}
              </h1>
              {shop.isVerified && (
                <span className="bg-yellow-400 text-slate-900 text-[10px] px-2.5 py-1 rounded-full font-black uppercase flex items-center gap-1 shadow-md">
                  <CheckCircle className="h-3.5 w-3.5 fill-current text-white dark:text-gray-900" /> VERIFIED MERCHANT
                </span>
              )}
            </div>
            
            <p className="text-sm text-blue-100 dark:text-gray-200 mt-2 max-w-2xl leading-relaxed">
              {shop.description}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs sm:text-sm font-semibold text-blue-50">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {shop.location.city}, {shop.location.subCity}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="h-4 w-4" /> {shop.phone}
              </span>
              <span className="bg-white/20 text-yellow-300 dark:text-yellow-400 font-bold px-3 py-1 rounded-full flex items-center gap-1">
                ★ {shop.rating} Shop Rank
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COMPONENT: Shop Active Listings */}
        <div className="lg:col-span-8 space-y-6">
          
          <div>
            <h3 className="font-sans font-black text-lg text-gray-900 dark:text-white flex items-center gap-1.5">
              📱 Active Auctions by {shop.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">All prices displayed are in Ethiopian Birr (ETB)</p>
          </div>

          {shopListings.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/10 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
              <ShoppingBag className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-xs font-bold uppercase tracking-wider">No active auctions at the moment</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This shop has no active bidding cycles currently.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {shopListings.map((listing) => (
                <div
                  key={listing.id}
                  onClick={() => onViewListing(listing)}
                  className="p-4 rounded-2xl border border-gray-150 dark:border-gray-800/80 hover:border-yellow-400 bg-white dark:bg-gray-900 flex gap-4 cursor-pointer transition-all hover:shadow-md"
                >
                  <img
                    src={listing.images[0]}
                    alt={listing.model}
                    className="h-20 w-20 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded">
                        {listing.brand}
                      </span>
                      <h4 className="font-extrabold text-xs text-gray-900 dark:text-white mt-1 truncate">
                        {listing.brand} {listing.model}
                      </h4>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                        Battery BH: {listing.batteryHealth}% • {listing.storage}
                      </p>
                    </div>
                    <p className="text-xs font-black text-yellow-600 dark:text-yellow-400 mt-1">
                      ETB {listing.currentBid.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Map Mockup */}
          <div className="bg-gray-50 dark:bg-gray-800/40 p-5 rounded-3xl border border-gray-150 dark:border-gray-850/80">
            <h4 className="font-sans font-extrabold text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
              🗺️ Storefront Map Location (Addis Ababa)
            </h4>
            <div className="bg-gray-200 dark:bg-gray-950 rounded-2xl h-56 relative overflow-hidden border border-gray-150 dark:border-gray-800 flex items-center justify-center">
              {/* Map grid lines simulation */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
              
              {/* Mock roads */}
              <div className="absolute top-1/2 left-0 right-0 h-4 bg-gray-300 dark:bg-gray-800 transform -translate-y-1/2"></div>
              <div className="absolute left-1/3 top-0 bottom-0 w-4 bg-gray-300 dark:bg-gray-800"></div>
              <div className="absolute left-2/3 top-0 bottom-0 w-4 bg-gray-300 dark:bg-gray-800"></div>

              {/* Bole Pin marker */}
              <div className="absolute top-1/2 left-2/3 transform -translate-x-1/2 -translate-y-1/2 text-center animate-bounce">
                <MapPin className="h-8 w-8 text-red-500 fill-current" />
              </div>
              
              <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-gray-900/95 px-3 py-2 rounded-xl text-[10px] font-bold text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800">
                📌 {shop.location.address}
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COMPONENT: Merchant Reviews & Feedback */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="border border-gray-150 dark:border-gray-800 rounded-3xl p-5 bg-white dark:bg-gray-900">
            <h4 className="font-sans font-black text-sm text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Star className="h-4.5 w-4.5 text-yellow-500 fill-current" /> Store Reviews ({shop.reviews.length})
            </h4>

            {/* Form to submit review */}
            {currentUser.role !== UserRole.ADMIN && (
              <form onSubmit={handleSubmitReview} className="space-y-3.5 mb-5 pb-5 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500 font-bold uppercase">Rate Shop:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <button
                        type="button"
                        key={stars}
                        onClick={() => setReviewRating(stars)}
                        className="text-yellow-400 focus:outline-none hover:scale-110 transition-transform"
                      >
                        <Star className={`h-4.5 w-4.5 ${stars <= reviewRating ? "fill-current" : ""}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <textarea
                    rows={2}
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Write your honest storefront review..."
                    className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-750 rounded-xl p-3 focus:outline-none"
                  ></textarea>
                </div>

                {reviewSuccess ? (
                  <p className="text-xs text-green-600 font-bold">🎉 Review submitted successfully!</p>
                ) : (
                  <button
                    type="submit"
                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold py-2 rounded-xl text-xs"
                    id="submit-review-btn"
                  >
                    Submit Review
                  </button>
                )}
              </form>
            )}

            {/* Reviews List */}
            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {shop.reviews.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-[11px]">No reviews yet. Be the first to review!</p>
                </div>
              ) : (
                shop.reviews.map((rev) => (
                  <div key={rev.id} className="text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-gray-900 dark:text-white truncate max-w-[120px]">{rev.reviewerName}</span>
                      <div className="flex text-yellow-400 gap-0.5 scale-90">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 leading-normal">{rev.comment}</p>
                    <span className="text-[9px] text-gray-400 block pt-0.5">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
