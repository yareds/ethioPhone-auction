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
        className="mb-6 flex items-center gap-1.5 text-xs font-semibold text-[var(--color-ink)] bg-[var(--color-paper-soft)] border border-[var(--color-paper-soft)] hover:bg-[var(--color-paper-soft)]/80 rounded-xl px-4 py-2 transition-all shadow-sm"
        id="shop-back-btn"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Auctions
      </button>

      {/* Shop profile Banner/Logo Header */}
      <div className="bg-[var(--color-ink)] text-[var(--color-paper)] rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl relative overflow-hidden mb-8">
        <div className="absolute right-0 bottom-0 h-40 w-40 bg-[var(--color-gold)]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative">
          <img
            src={shop.logoUrl}
            alt={shop.name}
            className="h-20 w-20 sm:h-24 sm:w-24 rounded-3xl object-cover bg-[var(--color-paper)] border-2 border-[var(--color-paper-soft)] shadow-lg"
          />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display font-semibold text-2xl sm:text-3xl tracking-tight flex items-center gap-2 text-[var(--color-paper)]">
                {shop.name}
              </h1>
              {shop.isVerified && (
                <span className="seal flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5 fill-current" /> VERIFIED MERCHANT
                </span>
              )}
            </div>
            
            <p className="text-sm text-[var(--color-paper)]/70 mt-2 max-w-2xl leading-relaxed font-sans">
              {shop.description}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs sm:text-sm font-semibold text-[var(--color-paper)]/80">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-[var(--color-gold-soft)]" /> {shop.location.city}, {shop.location.subCity}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="h-4 w-4 text-[var(--color-gold-soft)]" /> {shop.phone}
              </span>
              <span className="bg-[var(--color-paper-soft)]/20 text-[var(--color-gold-soft)] font-semibold px-3 py-1 rounded-full flex items-center gap-1">
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
            <h3 className="font-display font-semibold text-lg text-[var(--color-ink)] flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-[var(--color-gold)]" /> Active Auctions by {shop.name}
            </h3>
            <p className="text-xs text-[var(--color-ink-soft)]/60">All prices displayed are in Ethiopian Birr (ETB)</p>
          </div>

          {shopListings.length === 0 ? (
            <div className="text-center py-12 text-[var(--color-ink-soft)]/60 bg-[var(--color-paper-soft)]/50 rounded-2xl border border-dashed border-[var(--color-paper-soft)]">
              <ShoppingBag className="h-10 w-10 mx-auto text-[var(--color-ink-soft)]/40 mb-3" />
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">No active auctions at the moment</p>
              <p className="text-xs text-[var(--color-ink-soft)]/70 mt-1">This shop has no active bidding cycles currently.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {shopListings.map((listing) => (
                <div
                  key={listing.id}
                  onClick={() => onViewListing(listing)}
                  className="p-4 rounded-2xl border border-[var(--color-paper-soft)] hover:border-[var(--color-gold)] bg-[var(--color-paper)] flex gap-4 cursor-pointer transition-all hover:shadow-md"
                >
                  <img
                    src={listing.images[0]}
                    alt={listing.model}
                    className="h-20 w-20 rounded-xl object-cover shrink-0 border border-[var(--color-paper-soft)]"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-bold bg-[var(--color-paper-soft)] text-[var(--color-ink-soft)] px-1.5 py-0.5 rounded uppercase">
                        {listing.brand}
                      </span>
                      <h4 className="font-semibold text-xs text-[var(--color-ink)] mt-1 truncate">
                        {listing.brand} {listing.model}
                      </h4>
                      <p className="text-[10px] text-[var(--color-ink-soft)]/60 mt-0.5">
                        Battery BH: {listing.batteryHealth}% • {listing.storage}
                      </p>
                    </div>
                    <p className="text-xs font-display font-semibold text-[var(--color-gold)] mt-1">
                      ETB {listing.currentBid.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Map Mockup */}
          <div className="bg-[var(--color-paper-soft)]/50 p-5 rounded-3xl border border-[var(--color-paper-soft)]">
            <h4 className="font-display font-semibold text-xs text-[var(--color-ink-soft)]/60 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-[var(--color-gold)]" /> Storefront Map Location (Addis Ababa)
            </h4>
            <div className="bg-[var(--color-paper-soft)] rounded-2xl h-56 relative overflow-hidden border border-[var(--color-paper-soft)] flex items-center justify-center">
              {/* Map grid lines simulation */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
              
              {/* Mock roads */}
              <div className="absolute top-1/2 left-0 right-0 h-4 bg-[var(--color-paper-soft)]/80 transform -translate-y-1/2"></div>
              <div className="absolute left-1/3 top-0 bottom-0 w-4 bg-[var(--color-paper-soft)]/80"></div>
              <div className="absolute left-2/3 top-0 bottom-0 w-4 bg-[var(--color-paper-soft)]/80"></div>

              {/* Bole Pin marker */}
              <div className="absolute top-1/2 left-2/3 transform -translate-x-1/2 -translate-y-1/2 text-center animate-bounce">
                <MapPin className="h-8 w-8 text-[var(--color-danger)] fill-current" />
              </div>
              
              <div className="absolute bottom-4 left-4 bg-[var(--color-paper)]/95 px-3 py-2 rounded-xl text-[10px] font-semibold text-[var(--color-ink)] border border-[var(--color-paper-soft)] flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-[var(--color-gold)]" /> {shop.location.address}
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COMPONENT: Merchant Reviews & Feedback */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="border border-[var(--color-paper-soft)] rounded-3xl p-5 bg-[var(--color-paper)]">
            <h4 className="font-display font-semibold text-sm text-[var(--color-ink)] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Star className="h-4.5 w-4.5 text-[var(--color-gold)] fill-current" /> Store Reviews ({shop.reviews.length})
            </h4>

            {/* Form to submit review */}
            {currentUser.role !== UserRole.ADMIN && (
              <form onSubmit={handleSubmitReview} className="space-y-3.5 mb-5 pb-5 border-b border-[var(--color-paper-soft)]">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-[var(--color-ink-soft)] font-semibold uppercase">Rate Shop:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <button
                        type="button"
                        key={stars}
                        onClick={() => setReviewRating(stars)}
                        className="text-[var(--color-gold)] focus:outline-none hover:scale-110 transition-transform"
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
                    className="w-full text-xs bg-[var(--color-paper-soft)] text-[var(--color-ink)] border border-[var(--color-paper-soft)] rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]"
                  ></textarea>
                </div>

                {reviewSuccess ? (
                  <p className="text-xs text-[var(--color-verified)] font-bold">🎉 Review submitted successfully!</p>
                ) : (
                  <button
                    type="submit"
                    className="w-full bg-[var(--color-gold)] hover:bg-[var(--color-gold-soft)] text-[var(--color-ink)] font-bold py-2 rounded-xl text-xs transition-colors"
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
                <div className="text-center py-6 text-[var(--color-ink-soft)]/60">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-[var(--color-ink-soft)]/40" />
                  <p className="text-[11px]">No reviews yet. Be the first to review!</p>
                </div>
              ) : (
                shop.reviews.map((rev) => (
                  <div key={rev.id} className="text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[var(--color-ink)] truncate max-w-[120px]">{rev.reviewerName}</span>
                      <div className="flex text-[var(--color-gold)] gap-0.5 scale-90">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-[var(--color-ink-soft)] leading-normal">{rev.comment}</p>
                    <span className="text-[9px] text-[var(--color-ink-soft)]/60 block pt-0.5">
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
