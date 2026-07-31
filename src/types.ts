/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  BUYER = "buyer",
  SELLER = "seller",
  SHOP_OWNER = "shop_owner",
  ADMIN = "admin"
}

export enum AuctionStatus {
  UPCOMING = "upcoming",
  LIVE = "live",
  ENDED = "ended",
  WON = "won",
  PICKUP_PENDING = "pickup_pending",
  COMPLETED = "completed"
}

export enum PhoneCondition {
  NEW = "brand_new",
  EXCELLENT = "excellent",
  VERY_GOOD = "very_good",
  GOOD = "good",
  FAIR = "fair"
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  location: {
    region: string;
    city: string;
    subCity: string;
    address: string;
  };
  photoUrl?: string;
  rating: number;
  reviewCount: number;
  isVerifiedSeller: boolean;
  joinedDate: string;
  isBlocked?: boolean;
}

export interface ShopProfile {
  id: string;
  ownerId: string;
  name: string;
  logoUrl: string;
  description: string;
  phone: string;
  location: {
    region: string;
    city: string;
    subCity: string;
    address: string;
  };
  rating: number;
  reviews: ShopReview[];
  isVerified: boolean;
  bannerColor?: string;
}

export interface ShopReview {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface PhoneListing {
  id: string;
  sellerId: string;
  shopId?: string; // If listed by a verified shop
  brand: string;
  model: string;
  storage: string; // e.g., "128GB", "256GB"
  ram: string; // e.g., "8GB", "12GB"
  batteryHealth: number; // e.g., 92
  condition: PhoneCondition;
  conditionDetails: string;
  imei: string;
  isImeiVerified: boolean;
  accessories: string[]; // e.g., ["Original Box", "Charger", "Earphones"]
  images: string[];
  videoUrl?: string;
  startingBid: number; // In ETB
  currentBid: number; // In ETB
  minIncrement: number; // In ETB
  buyNowPrice?: number; // In ETB (optional Buy Now price)
  sellerLocation: {
    region: string;
    city: string;
    subCity: string;
    address: string;
  };
  status: AuctionStatus;
  startTime: string; // ISO string
  endTime: string; // ISO string
  winnerId?: string;
  pickupCode?: string; // 6-digit confirmation code for pickup
  createdAt: string;
  views: number;
  isFeatured?: boolean;
  reportsCount: number;
}

export interface Bid {
  id: string;
  listingId: string;
  bidderId: string;
  bidderName: string;
  amount: number; // In ETB
  timestamp: string; // ISO string
  isAutoBid?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "bid_placed" | "outbid" | "auction_won" | "auction_ended" | "pickup_ready" | "pickup_verified" | "general" | "listing_approved";
  listingId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  listingId: string;
  text: string;
  createdAt: string;
}

export interface Report {
  id: string;
  listingId: string;
  listingTitle: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  details: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: string;
}
