/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { UserProfile, ShopProfile, PhoneListing, Bid, ChatMessage, Report, Notification, UserRole, AuctionStatus, PhoneCondition } from "../types";
import { initialUsers, initialShops, initialListings, initialBids, initialMessages, initialReports } from "../data/mockData";
import { 
  db, 
  auth, 
  handleFirestoreError, 
  OperationType, 
  testFirestoreConnection 
} from "../lib/firebase";
import { 
  collection, 
  doc, 
  getDoc,
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  getDocs,
  runTransaction,
  query,
  where
} from "firebase/firestore";
import { 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from "firebase/auth";

export const guestUser: UserProfile = {
  id: "guest",
  name: "Guest Explorer",
  email: "guest@ethiophone.com",
  phone: "",
  role: UserRole.BUYER,
  location: {
    region: "Addis Ababa",
    city: "Addis Ababa",
    subCity: "Bole",
    address: "Bole Olympia"
  },
  rating: 5.0,
  reviewCount: 0,
  isVerifiedSeller: false,
  joinedDate: new Date().toISOString()
};

export const ADMIN_EMAILS = [
  "admin@ethiophone.com",
  "yared.abegaz@gmail.com",
  "admin@yonimobile.com"
];

export const checkIsAdmin = (email?: string | null, storedRole?: UserRole): boolean => {
  if (storedRole === UserRole.ADMIN) return true;
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.includes(normalized) || normalized.startsWith("admin@");
};

interface AppContextType {
  currentUser: UserProfile;
  users: UserProfile[];
  shops: ShopProfile[];
  listings: PhoneListing[];
  bids: Bid[];
  messages: ChatMessage[];
  reports: Report[];
  notifications: Notification[];
  watchlist: string[]; // Listing IDs

  // Auth Operations
  signOut: () => void;
  isPhoneSignedIn: boolean;
  signupUser: (userData: {
    name: string;
    email: string;
    phone: string;
    location: {
      region: string;
      city: string;
      subCity: string;
      address: string;
    };
    role: UserRole;
  }) => UserProfile;
  updateProfile: (profileData: Partial<UserProfile>) => void;
  registerShop: (shopData: Omit<ShopProfile, "id" | "ownerId" | "rating" | "reviews" | "isVerified">) => void;

  // Listing Operations
  createListing: (listingData: Omit<PhoneListing, "id" | "sellerId" | "shopId" | "currentBid" | "status" | "isImeiVerified" | "createdAt" | "views" | "reportsCount">) => { success: boolean; error?: string };
  updateListing: (id: string, listingData: Partial<PhoneListing>) => void;
  deleteListing: (id: string) => void;
  featureListing: (id: string) => void;
  incrementViews: (id: string) => void;

  // Admin Bid Operations
  deleteBid: (id: string) => void;
  updateBidAmount: (id: string, amount: number) => void;

  // Bidding Operations
  placeBid: (listingId: string, amount: number) => Promise<{ success: boolean; error?: string }>;
  buyNow: (listingId: string) => Promise<{ success: boolean; error?: string }>;

  // Watchlist & Favorites
  toggleWatchlist: (listingId: string) => void;

  // Communication
  sendMessage: (receiverId: string, listingId: string, text: string) => void;
  getChatPartners: () => UserProfile[];
  getMessagesForChat: (partnerId: string) => ChatMessage[];

  // Feedback & Trust
  submitReport: (listingId: string, reason: string, details: string) => void;
  addShopReview: (shopId: string, rating: number, comment: string) => void;
  verifySeller: (userId: string) => void;
  verifyShop: (shopId: string) => void;

  // Pickup Verification
  verifyPickupCode: (listingId: string, code: string) => { success: boolean; error?: string };

  // Admin Actions
  resolveReport: (reportId: string, action: "delete_listing" | "dismiss") => void;
  blockUser: (userId: string) => void;

  // Notification Operations
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // Search & Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;

  // Extra filter states destructured by App.tsx
  activeTab: string;
  setActiveTab: (tab: string) => void;
  brandFilter: string;
  batteryFilter: string;
  setBatteryFilter: (filter: string) => void;
  conditionFilter: string;
  setConditionFilter: (filter: string) => void;
  locationFilter: string;
  sortOption: string;
  setSortOption: (option: string) => void;
  simulateTimeTick: () => void;

  // Theme
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("ethio_phone_dark_mode");
    return saved ? JSON.parse(saved) : false;
  });

  // Database core state initialized with mockData defaults
  const [users, setUsers] = useState<UserProfile[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<UserProfile>(guestUser);
  const [shops, setShops] = useState<ShopProfile[]>(initialShops);
  const [listings, setListings] = useState<PhoneListing[]>(initialListings);
  const [bids, setBids] = useState<Bid[]>(initialBids);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [notifications, setNotifications] = useState<Notification[]>(() => [
    {
      id: "notif-welcome",
      userId: "user-admin",
      title: "Welcome to YONIMobile Auction!",
      message: "Your primary auction hub. Connected to Firebase Firestore backend.",
      type: "general",
      isRead: false,
      createdAt: new Date().toISOString()
    }
  ]);

  const [watchlist, setWatchlist] = useState<string[]>(() => ["listing-iphone15", "listing-iphone13"]);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const [activeTab, setActiveTab] = useState<string>("home");
  const [batteryFilter, setBatteryFilter] = useState<string>("All");
  const [conditionFilter, setConditionFilter] = useState<string>("All");
  const [sortOption, setSortOption] = useState<string>("ending_soon");

  const brandFilter = selectedBrand || "All";
  const locationFilter = selectedRegion || "All";

  // 1. Firebase Initialization & Realtime Firestore Subscriptions
  useEffect(() => {
    testFirestoreConnection();

    // Subscribe to public collections: shops, listings, bids
    const unsubShops = onSnapshot(collection(db, "shops"), (snapshot) => {
      if (!snapshot.empty) {
        const fetchedShops: ShopProfile[] = [];
        snapshot.forEach((d) => fetchedShops.push(d.data() as ShopProfile));
        setShops(fetchedShops);
      } else {
        setShops(initialShops);
        initialShops.forEach((s) => {
          setDoc(doc(db, "shops", s.id), s).catch(() => {});
        });
      }
    }, (err) => {
      console.warn("Public shops read failed, using local initialShops", err);
    });

    const unsubListings = onSnapshot(collection(db, "listings"), (snapshot) => {
      if (!snapshot.empty) {
        const fetchedListings: PhoneListing[] = [];
        snapshot.forEach((d) => fetchedListings.push(d.data() as PhoneListing));
        setListings(fetchedListings);
      } else {
        setListings(initialListings);
        initialListings.forEach((l) => {
          setDoc(doc(db, "listings", l.id), l).catch(() => {});
        });
      }
    }, (err) => {
      console.warn("Public listings read failed, using local initialListings", err);
    });

    const unsubBids = onSnapshot(collection(db, "bids"), (snapshot) => {
      if (!snapshot.empty) {
        const fetchedBids: Bid[] = [];
        snapshot.forEach((d) => fetchedBids.push(d.data() as Bid));
        setBids(fetchedBids);
      } else {
        setBids(initialBids);
        initialBids.forEach((b) => {
          setDoc(doc(db, "bids", b.id), b).catch(() => {});
        });
      }
    }, (err) => {
      console.warn("Public bids read failed, using local initialBids", err);
    });

    let userSubscriptionsCleanup: (() => void) | null = null;

    // Listen to Firebase Auth state changes
    const unsubAuth = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (userSubscriptionsCleanup) {
        userSubscriptionsCleanup();
        userSubscriptionsCleanup = null;
      }

      if (fbUser) {
        const userDocRef = doc(db, "users", fbUser.uid);
        let userProfile: UserProfile;

        try {
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            userProfile = userSnap.data() as UserProfile;
            const isAdmin = checkIsAdmin(fbUser.email, userProfile.role);
            if (isAdmin && userProfile.role !== UserRole.ADMIN) {
              userProfile.role = UserRole.ADMIN;
              userProfile.isVerifiedSeller = true;
              setDoc(userDocRef, { role: UserRole.ADMIN, isVerifiedSeller: true }, { merge: true }).catch((e) =>
                console.warn("Could not set admin role in Firestore:", e)
              );
            }
          } else {
            const isAdmin = checkIsAdmin(fbUser.email);
            userProfile = {
              id: fbUser.uid,
              name: fbUser.displayName || (fbUser.email ? fbUser.email.split("@")[0] : (isAdmin ? "EthioPhone Admin" : "EthioPhone User")),
              email: fbUser.email || "",
              phone: fbUser.phoneNumber || "",
              role: isAdmin ? UserRole.ADMIN : UserRole.BUYER,
              location: {
                region: "Addis Ababa",
                city: "Addis Ababa",
                subCity: "Bole",
                address: "Bole Central Area"
              },
              photoUrl: fbUser.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
              rating: 5.0,
              reviewCount: 0,
              isVerifiedSeller: isAdmin,
              joinedDate: new Date().toISOString()
            };

            await setDoc(userDocRef, userProfile);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${fbUser.uid}`);
          const isAdmin = checkIsAdmin(fbUser.email);
          userProfile = {
            id: fbUser.uid,
            name: fbUser.displayName || (fbUser.email ? fbUser.email.split("@")[0] : (isAdmin ? "EthioPhone Admin" : "EthioPhone User")),
            email: fbUser.email || "",
            phone: fbUser.phoneNumber || "",
            role: isAdmin ? UserRole.ADMIN : UserRole.BUYER,
            location: {
              region: "Addis Ababa",
              city: "Addis Ababa",
              subCity: "Bole",
              address: "Bole Central Area"
            },
            photoUrl: fbUser.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
            rating: 5.0,
            reviewCount: 0,
            isVerifiedSeller: isAdmin,
            joinedDate: new Date().toISOString()
          };
        }

        setCurrentUser(userProfile);

        // Subscribe to users collection (allowed for signed-in users)
        const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
          if (!snapshot.empty) {
            const fetchedUsers: UserProfile[] = [];
            snapshot.forEach((d) => fetchedUsers.push(d.data() as UserProfile));
            setUsers(fetchedUsers);
          }
        }, () => {});

        // Subscribe to notifications for current user
        const notifQuery = query(collection(db, "notifications"), where("userId", "==", fbUser.uid));
        const unsubNotifs = onSnapshot(notifQuery, (snapshot) => {
          if (!snapshot.empty) {
            const fetchedNotifs: Notification[] = [];
            snapshot.forEach((d) => fetchedNotifs.push(d.data() as Notification));
            setNotifications(fetchedNotifs);
          }
        }, () => {});

        // Subscribe to user messages
        const msgQuerySent = query(collection(db, "messages"), where("senderId", "==", fbUser.uid));
        const unsubMsgSent = onSnapshot(msgQuerySent, (snapshot) => {
          if (!snapshot.empty) {
            const fetchedMsgs: ChatMessage[] = [];
            snapshot.forEach((d) => fetchedMsgs.push(d.data() as ChatMessage));
            setMessages((prev) => {
              const otherMsgs = prev.filter((m) => m.senderId !== fbUser.uid);
              return [...otherMsgs, ...fetchedMsgs];
            });
          }
        }, () => {});

        const msgQueryRecv = query(collection(db, "messages"), where("receiverId", "==", fbUser.uid));
        const unsubMsgRecv = onSnapshot(msgQueryRecv, (snapshot) => {
          if (!snapshot.empty) {
            const fetchedMsgs: ChatMessage[] = [];
            snapshot.forEach((d) => fetchedMsgs.push(d.data() as ChatMessage));
            setMessages((prev) => {
              const otherMsgs = prev.filter((m) => m.receiverId !== fbUser.uid);
              return [...otherMsgs, ...fetchedMsgs];
            });
          }
        }, () => {});

        // Subscribe to reports (admin sees all, regular user sees own)
        const reportsQuery = userProfile.role === UserRole.ADMIN
          ? collection(db, "reports")
          : query(collection(db, "reports"), where("reporterId", "==", fbUser.uid));
        const unsubReports = onSnapshot(reportsQuery, (snapshot) => {
          if (!snapshot.empty) {
            const fetchedReps: Report[] = [];
            snapshot.forEach((d) => fetchedReps.push(d.data() as Report));
            setReports(fetchedReps);
          }
        }, () => {});

        userSubscriptionsCleanup = () => {
          unsubUsers();
          unsubNotifs();
          unsubMsgSent();
          unsubMsgRecv();
          unsubReports();
        };
      } else {
        setCurrentUser(guestUser);
        setUsers(initialUsers);
        setMessages(initialMessages);
        setReports(initialReports);
      }
    });

    return () => {
      unsubAuth();
      unsubShops();
      unsubListings();
      unsubBids();
      if (userSubscriptionsCleanup) userSubscriptionsCleanup();
    };
  }, []);

  // Theme LocalStorage Sync
  useEffect(() => {
    localStorage.setItem("ethio_phone_dark_mode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Realtime Simulation Loop: Countdowns, Expirations
  const simulateTimeTick = () => {
    const now = new Date();

    setListings((prevListings) => {
      let listingsChanged = false;
      const updated = prevListings.map((listing) => {
        const startTime = new Date(listing.startTime);
        const endTime = new Date(listing.endTime);

        let newStatus = listing.status;

        if (listing.status === AuctionStatus.UPCOMING && now >= startTime) {
          newStatus = AuctionStatus.LIVE;
          listingsChanged = true;
        } else if (listing.status === AuctionStatus.LIVE && now >= endTime) {
          const listingBids = bids.filter((b) => b.listingId === listing.id);
          if (listingBids.length > 0) {
            const sortedBids = [...listingBids].sort((a, b) => b.amount - a.amount);
            const topBid = sortedBids[0];
            newStatus = AuctionStatus.ENDED;
            listing.winnerId = topBid.bidderId;

            const confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();
            listing.pickupCode = confirmationCode;

            triggerNotification(
              topBid.bidderId,
              "🏆 Auction Won!",
              `You won the auction for ${listing.brand} ${listing.model} with a bid of ETB ${topBid.amount.toLocaleString()}. Code: ${confirmationCode}`,
              "auction_won",
              listing.id
            );

            triggerNotification(
              listing.sellerId,
              "🎉 Auction Completed!",
              `Your auction for ${listing.brand} ${listing.model} has ended. Winner is ${topBid.bidderName}.`,
              "auction_ended",
              listing.id
            );
          } else {
            newStatus = AuctionStatus.ENDED;
            triggerNotification(
              listing.sellerId,
              "⏳ Auction Ended (No Bids)",
              `Your auction for ${listing.brand} ${listing.model} ended with no bids.`,
              "auction_ended",
              listing.id
            );
          }
          listingsChanged = true;
        }

        if (newStatus !== listing.status) {
          const updatedListing = { ...listing, status: newStatus };
          if (auth.currentUser && (auth.currentUser.uid === listing.sellerId || currentUser.role === UserRole.ADMIN)) {
            setDoc(doc(db, "listings", listing.id), updatedListing, { merge: true }).catch((e) =>
              handleFirestoreError(e, OperationType.UPDATE, `listings/${listing.id}`)
            );
          }
          return updatedListing;
        }
        return listing;
      });

      return listingsChanged ? updated : prevListings;
    });
  };

  const simulateTimeTickRef = useRef(simulateTimeTick);
  useEffect(() => {
    simulateTimeTickRef.current = simulateTimeTick;
  }, [simulateTimeTick]);

  useEffect(() => {
    const interval = setInterval(() => {
      simulateTimeTickRef.current();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  // Authentication Operations
  const isPhoneSignedIn = Boolean(
    auth.currentUser?.providerData.some((p) => p.providerId === "phone") ||
      (currentUser.id !== "guest" && currentUser.phone)
  );

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.error("Sign-out error:", e);
    }
    setCurrentUser(guestUser);
    setActiveTab("home");
  };

  const signupUser = (userData: {
    name: string;
    email: string;
    phone: string;
    location: {
      region: string;
      city: string;
      subCity: string;
      address: string;
    };
    role: UserRole;
  }) => {
    const newUserId = auth.currentUser ? auth.currentUser.uid : `user-${Date.now()}`;
    const isAdmin = checkIsAdmin(userData.email, userData.role);
    const assignedRole = isAdmin ? UserRole.ADMIN : (userData.role || UserRole.BUYER);
    const newUser: UserProfile = {
      id: newUserId,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      role: assignedRole,
      location: userData.location,
      photoUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      rating: 5.0,
      reviewCount: 0,
      isVerifiedSeller: isAdmin || userData.role === UserRole.SHOP_OWNER,
      joinedDate: new Date().toISOString()
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);

    setDoc(doc(db, "users", newUserId), newUser).catch((e) =>
      handleFirestoreError(e, OperationType.WRITE, `users/${newUserId}`)
    );

    if (userData.role === UserRole.SHOP_OWNER) {
      const newShopId = `shop-${Date.now()}`;
      const newShop: ShopProfile = {
        id: newShopId,
        ownerId: newUserId,
        name: `${userData.name}'s Smartphone Plaza`,
        logoUrl: "https://images.unsplash.com/photo-1555421689-491a97ff2040?w=150&auto=format&fit=crop&q=80",
        description: `Premium, verified smart-devices store owned by ${userData.name}. High-quality inventory in ${userData.location.subCity}.`,
        phone: userData.phone,
        location: userData.location,
        rating: 5.0,
        isVerified: true,
        reviews: []
      };
      setShops((prev) => [...prev, newShop]);
      setDoc(doc(db, "shops", newShopId), newShop).catch((e) =>
        handleFirestoreError(e, OperationType.WRITE, `shops/${newShopId}`)
      );
    }

    triggerNotification(
      newUserId,
      "🎉 Welcome to YONIMobile Auction!",
      `Hello ${userData.name}, you have successfully signed up on YONIMobile.`,
      "general"
    );

    return newUser;
  };

  const updateProfile = (profileData: Partial<UserProfile>) => {
    const updated = { ...currentUser, ...profileData };
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
    setCurrentUser(updated);

    const targetDocId = auth.currentUser ? auth.currentUser.uid : currentUser.id;
    setDoc(doc(db, "users", targetDocId), updated, { merge: true }).catch((e) =>
      handleFirestoreError(e, OperationType.UPDATE, `users/${targetDocId}`)
    );
  };

  const registerShop = (shopData: Omit<ShopProfile, "id" | "ownerId" | "rating" | "reviews" | "isVerified">) => {
    const newShopId = `shop-${Date.now()}`;
    const newShop: ShopProfile = {
      ...shopData,
      id: newShopId,
      ownerId: currentUser.id,
      rating: 5.0,
      isVerified: false,
      reviews: []
    };

    setShops((prev) => [...prev, newShop]);
    setDoc(doc(db, "shops", newShopId), newShop).catch((e) =>
      handleFirestoreError(e, OperationType.WRITE, `shops/${newShopId}`)
    );

    if (currentUser.role !== UserRole.ADMIN) {
      updateProfile({ role: UserRole.SHOP_OWNER });
    }

    triggerNotification(
      currentUser.id,
      "🏪 Shop Registered",
      `Your shop "${shopData.name}" has been registered in Firestore database!`,
      "general"
    );
  };

  const createListing = (listingData: Omit<PhoneListing, "id" | "sellerId" | "shopId" | "currentBid" | "status" | "isImeiVerified" | "createdAt" | "views" | "reportsCount">) => {
    if (currentUser.role !== UserRole.ADMIN) {
      return {
        success: false,
        error: "🚫 Unauthorized! Only the YONIMobile Admin has authorization to list phones."
      };
    }

    const activeImeiDuplicates = listings.filter(
      (l) => l.imei === listingData.imei && (l.status === AuctionStatus.LIVE || l.status === AuctionStatus.UPCOMING)
    );
    if (activeImeiDuplicates.length > 0) {
      return {
        success: false,
        error: "🚫 Duplicate Listing Detected! An active auction with the same IMEI number exists."
      };
    }

    const cleanImei = listingData.imei.replace(/\s+/g, "");
    if (!/^\d{15}$/.test(cleanImei)) {
      return {
        success: false,
        error: "❌ Invalid IMEI format. IMEI must be exactly 15 numeric digits."
      };
    }

    const listingId = `listing-${Date.now()}`;
    const userShop = shops.find((s) => s.ownerId === currentUser.id);

    const startTime = new Date(listingData.startTime);
    const now = new Date();
    const isLive = now >= startTime;

    const newListing: PhoneListing = {
      ...listingData,
      id: listingId,
      sellerId: currentUser.id,
      shopId: userShop?.id,
      currentBid: listingData.startingBid,
      status: isLive ? AuctionStatus.LIVE : AuctionStatus.UPCOMING,
      isImeiVerified: true,
      createdAt: now.toISOString(),
      views: 0,
      reportsCount: 0
    };

    setListings((prev) => [newListing, ...prev]);
    setDoc(doc(db, "listings", listingId), newListing).catch((e) =>
      handleFirestoreError(e, OperationType.WRITE, `listings/${listingId}`)
    );

    triggerNotification(
      currentUser.id,
      "🏷️ Listing Created",
      `Your auction for ${newListing.brand} ${newListing.model} is now active on Firestore!`,
      "listing_approved",
      listingId
    );

    return { success: true };
  };

  const updateListing = (id: string, listingData: Partial<PhoneListing>) => {
    if (currentUser.role !== UserRole.ADMIN) return;
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...listingData } : l))
    );
    setDoc(doc(db, "listings", id), listingData, { merge: true }).catch((e) =>
      handleFirestoreError(e, OperationType.UPDATE, `listings/${id}`)
    );
  };

  const deleteListing = (id: string) => {
    if (currentUser.role !== UserRole.ADMIN) return;
    setListings((prev) => prev.filter((l) => l.id !== id));
    deleteDoc(doc(db, "listings", id)).catch((e) =>
      handleFirestoreError(e, OperationType.DELETE, `listings/${id}`)
    );
  };

  const deleteBid = (bidId: string) => {
    if (currentUser.role !== UserRole.ADMIN) return;
    setBids((prev) => prev.filter((b) => b.id !== bidId));
    deleteDoc(doc(db, "bids", bidId)).catch((e) =>
      handleFirestoreError(e, OperationType.DELETE, `bids/${bidId}`)
    );
  };

  const updateBidAmount = (bidId: string, newAmount: number) => {
    if (currentUser.role !== UserRole.ADMIN) return;
    setBids((prev) =>
      prev.map((b) => (b.id === bidId ? { ...b, amount: newAmount } : b))
    );
    updateDoc(doc(db, "bids", bidId), { amount: newAmount }).catch((e) =>
      handleFirestoreError(e, OperationType.UPDATE, `bids/${bidId}`)
    );
  };

  const featureListing = (id: string) => {
    const listing = listings.find((l) => l.id === id);
    if (!listing) return;
    const isFeatured = !listing.isFeatured;
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isFeatured } : l))
    );
    updateDoc(doc(db, "listings", id), { isFeatured }).catch((e) =>
      handleFirestoreError(e, OperationType.UPDATE, `listings/${id}`)
    );
  };

  const incrementViews = (id: string) => {
    const listing = listings.find((l) => l.id === id);
    if (!listing) return;
    const views = listing.views + 1;
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, views } : l))
    );
    if (auth.currentUser) {
      updateDoc(doc(db, "listings", id), { views }).catch((e) =>
        handleFirestoreError(e, OperationType.UPDATE, `listings/${id}`)
      );
    }
  };

  const placeBid = async (listingId: string, amount: number) => {
    if (currentUser.id === "guest") {
      return { success: false, error: "Please sign in to place a bid on this device." };
    }

    const listingRef = doc(db, "listings", listingId);
    const newBidId = `bid-${Date.now()}`;
    const bidRef = doc(db, "bids", newBidId);

    // Pre-check if listing document exists in Firestore; if missing but present in local state, seed it first
    try {
      const checkSnap = await getDoc(listingRef);
      if (!checkSnap.exists()) {
        const localListing = listings.find((l) => l.id === listingId);
        if (localListing) {
          await setDoc(listingRef, localListing);
        }
      }
    } catch (e) {
      console.warn("Pre-check listing doc error:", e);
    }

    try {
      let sellerId = "";
      let brand = "";
      let model = "";

      await runTransaction(db, async (transaction) => {
        const listingDoc = await transaction.get(listingRef);
        let listingData: PhoneListing;

        if (!listingDoc.exists()) {
          const localListing = listings.find((l) => l.id === listingId);
          if (localListing) {
            transaction.set(listingRef, localListing);
            listingData = localListing;
          } else {
            throw new Error("Listing not found");
          }
        } else {
          listingData = listingDoc.data() as PhoneListing;
        }

        if (listingData.status !== AuctionStatus.LIVE) {
          throw new Error("Auction is not currently live");
        }

        if (listingData.sellerId === currentUser.id) {
          throw new Error("You cannot bid on your own phone auction.");
        }

        if (amount <= listingData.currentBid) {
          throw new Error(`Bid must be higher than current bid (ETB ${listingData.currentBid.toLocaleString()})`);
        }

        const minIncrement = listingData.minIncrement || 0;
        const minAcceptable = listingData.currentBid + minIncrement;
        if (amount < minAcceptable) {
          throw new Error(`Minimum bid increment is ETB ${minIncrement.toLocaleString()}. Bid must be at least ETB ${minAcceptable.toLocaleString()}`);
        }

        sellerId = listingData.sellerId;
        brand = listingData.brand;
        model = listingData.model;

        const effectiveBidderId = auth.currentUser ? auth.currentUser.uid : currentUser.id;
        const effectiveBidderName = currentUser.name || auth.currentUser?.displayName || "EthioPhone Buyer";

        const newBid: Bid = {
          id: newBidId,
          listingId,
          bidderId: effectiveBidderId,
          bidderName: effectiveBidderName,
          amount,
          timestamp: new Date().toISOString()
        };

        transaction.set(bidRef, newBid);
        transaction.update(listingRef, { currentBid: amount });
      });

      setBids((prev) => [
        ...prev,
        {
          id: newBidId,
          listingId,
          bidderId: currentUser.id,
          bidderName: currentUser.name,
          amount,
          timestamp: new Date().toISOString()
        }
      ]);

      setListings((prev) =>
        prev.map((l) => (l.id === listingId ? { ...l, currentBid: amount } : l))
      );

      if (!watchlist.includes(listingId)) {
        setWatchlist((prev) => [...prev, listingId]);
      }

      if (sellerId) {
        triggerNotification(
          sellerId,
          "💰 New Bid Placed",
          `${currentUser.name} placed a bid of ETB ${amount.toLocaleString()} on your ${brand} ${model}!`,
          "bid_placed",
          listingId
        );
      }

      return { success: true };
    } catch (error: any) {
      console.error("Error in placeBid transaction:", error);
      const errorMessage = error?.message || "Failed to place bid.";
      return { success: false, error: errorMessage };
    }
  };

  const buyNow = async (listingId: string) => {
    if (currentUser.id === "guest") {
      return { success: false, error: "Please sign in to buy this phone." };
    }

    const listingRef = doc(db, "listings", listingId);
    const newBidId = `bid-${Date.now()}`;
    const bidRef = doc(db, "bids", newBidId);
    const now = new Date();
    const confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Pre-check if listing document exists in Firestore; if missing but present in local state, seed it first
    try {
      const checkSnap = await getDoc(listingRef);
      if (!checkSnap.exists()) {
        const localListing = listings.find((l) => l.id === listingId);
        if (localListing) {
          await setDoc(listingRef, localListing);
        }
      }
    } catch (e) {
      console.warn("Pre-check listing doc error:", e);
    }

    let finalAmount = 0;
    let sellerId = "";
    let brand = "";
    let model = "";

    try {
      await runTransaction(db, async (transaction) => {
        const listingDoc = await transaction.get(listingRef);
        let listingData: PhoneListing;

        if (!listingDoc.exists()) {
          const localListing = listings.find((l) => l.id === listingId);
          if (localListing) {
            transaction.set(listingRef, localListing);
            listingData = localListing;
          } else {
            throw new Error("Listing not found");
          }
        } else {
          listingData = listingDoc.data() as PhoneListing;
        }

        if (!listingData.buyNowPrice) {
          throw new Error("Buy now not available for this listing");
        }

        if (listingData.status !== AuctionStatus.LIVE) {
          throw new Error("Auction is not currently live");
        }

        if (listingData.sellerId === currentUser.id) {
          throw new Error("You cannot buy your own phone.");
        }

        finalAmount = listingData.buyNowPrice;
        sellerId = listingData.sellerId;
        brand = listingData.brand;
        model = listingData.model;

        const effectiveBidderId = auth.currentUser ? auth.currentUser.uid : currentUser.id;
        const effectiveBidderName = currentUser.name || auth.currentUser?.displayName || "EthioPhone Buyer";

        const newBid: Bid = {
          id: newBidId,
          listingId,
          bidderId: effectiveBidderId,
          bidderName: effectiveBidderName,
          amount: finalAmount,
          timestamp: now.toISOString()
        };

        const updatedListing = {
          currentBid: finalAmount,
          status: AuctionStatus.ENDED,
          winnerId: currentUser.id,
          pickupCode: confirmationCode
        };

        transaction.set(bidRef, newBid);
        transaction.update(listingRef, updatedListing);
      });

      setBids((prev) => [
        ...prev,
        {
          id: newBidId,
          listingId,
          bidderId: currentUser.id,
          bidderName: currentUser.name,
          amount: finalAmount,
          timestamp: now.toISOString()
        }
      ]);

      setListings((prev) =>
        prev.map((l) =>
          l.id === listingId
            ? {
                ...l,
                currentBid: finalAmount,
                status: AuctionStatus.ENDED,
                winnerId: currentUser.id,
                pickupCode: confirmationCode
              }
            : l
        )
      );

      triggerNotification(
        currentUser.id,
        "🏆 Bought It Now!",
        `You bought ${brand} ${model} instantly for ETB ${finalAmount.toLocaleString()}! Code: ${confirmationCode}`,
        "auction_won",
        listingId
      );

      if (sellerId) {
        triggerNotification(
          sellerId,
          "📦 Immediate Sale!",
          `${currentUser.name} bought your ${brand} ${model} using Buy Now for ETB ${finalAmount.toLocaleString()}!`,
          "auction_ended",
          listingId
        );
      }

      return { success: true };
    } catch (error: any) {
      console.error("Error in buyNow transaction:", error);
      const errorMessage = error?.message || "Failed to complete Buy Now purchase.";
      return { success: false, error: errorMessage };
    }
  };

  const toggleWatchlist = (listingId: string) => {
    setWatchlist((prev) =>
      prev.includes(listingId)
        ? prev.filter((id) => id !== listingId)
        : [...prev, listingId]
    );
  };

  const triggerNotification = (
    userId: string,
    title: string,
    message: string,
    type: Notification["type"],
    listingId?: string
  ) => {
    const notifId = `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newNotif: Notification = {
      id: notifId,
      userId,
      title,
      message,
      type,
      listingId,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications((prev) => [newNotif, ...prev]);
    if (auth.currentUser) {
      setDoc(doc(db, "notifications", notifId), newNotif).catch((e) =>
        handleFirestoreError(e, OperationType.WRITE, `notifications/${notifId}`)
      );
    }
  };

  const sendMessage = (receiverId: string, listingId: string, text: string) => {
    if (currentUser.id === "guest") return;
    const msgId = `msg-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: msgId,
      senderId: currentUser.id,
      receiverId,
      listingId,
      text,
      createdAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, newMsg]);
    setDoc(doc(db, "messages", msgId), newMsg).catch((e) =>
      handleFirestoreError(e, OperationType.WRITE, `messages/${msgId}`)
    );
  };

  const getChatPartners = (): UserProfile[] => {
    const partnerIds = new Set<string>();
    messages.forEach((m) => {
      if (m.senderId === currentUser.id) partnerIds.add(m.receiverId);
      if (m.receiverId === currentUser.id) partnerIds.add(m.senderId);
    });

    return users.filter((u) => partnerIds.has(u.id));
  };

  const getMessagesForChat = (partnerId: string): ChatMessage[] => {
    return messages
      .filter(
        (m) =>
          (m.senderId === currentUser.id && m.receiverId === partnerId) ||
          (m.senderId === partnerId && m.receiverId === currentUser.id)
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  };

  const submitReport = (listingId: string, reason: string, details: string) => {
    const listing = listings.find((l) => l.id === listingId);
    if (!listing) return;

    const repId = `rep-${Date.now()}`;
    const newReport: Report = {
      id: repId,
      listingId,
      listingTitle: `${listing.brand} ${listing.model}`,
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      reason,
      details,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    setReports((prev) => [newReport, ...prev]);
    setDoc(doc(db, "reports", repId), newReport).catch((e) =>
      handleFirestoreError(e, OperationType.WRITE, `reports/${repId}`)
    );

    const reportsCount = listing.reportsCount + 1;
    setListings((prev) =>
      prev.map((l) => (l.id === listingId ? { ...l, reportsCount } : l))
    );
    updateDoc(doc(db, "listings", listingId), { reportsCount }).catch((e) =>
      handleFirestoreError(e, OperationType.UPDATE, `listings/${listingId}`)
    );
  };

  const addShopReview = (shopId: string, rating: number, comment: string) => {
    const newReview = {
      id: `rev-${Date.now()}`,
      reviewerName: currentUser.name,
      rating,
      comment,
      createdAt: new Date().toISOString()
    };

    setShops((prevShops) =>
      prevShops.map((s) => {
        if (s.id === shopId) {
          const updatedReviews = [newReview, ...s.reviews];
          const average = parseFloat((updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1));
          const updatedShop = { ...s, reviews: updatedReviews, rating: average };
          setDoc(doc(db, "shops", shopId), updatedShop, { merge: true }).catch((e) =>
            handleFirestoreError(e, OperationType.UPDATE, `shops/${shopId}`)
          );
          return updatedShop;
        }
        return s;
      })
    );
  };

  const verifySeller = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isVerifiedSeller: true } : u))
    );
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, isVerifiedSeller: true }));
    }
    updateDoc(doc(db, "users", userId), { isVerifiedSeller: true }).catch((e) =>
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}`)
    );
    triggerNotification(userId, "✅ Account Verified", "Your account has been verified by administrator.", "general");
  };

  const verifyShop = (shopId: string) => {
    setShops((prev) =>
      prev.map((s) => (s.id === shopId ? { ...s, isVerified: true } : s))
    );
    updateDoc(doc(db, "shops", shopId), { isVerified: true }).catch((e) =>
      handleFirestoreError(e, OperationType.UPDATE, `shops/${shopId}`)
    );
    const shop = shops.find((s) => s.id === shopId);
    if (shop) {
      triggerNotification(shop.ownerId, "🏬 Shop Verified!", `Your shop "${shop.name}" has been fully verified.`, "general");
    }
  };

  const verifyPickupCode = (listingId: string, code: string) => {
    const listing = listings.find((l) => l.id === listingId);
    if (!listing) return { success: false, error: "Listing not found" };

    if (listing.sellerId !== currentUser.id) {
      return { success: false, error: "Only the seller can verify the pickup." };
    }

    if (listing.pickupCode !== code.trim()) {
      return { success: false, error: "Incorrect verification code. Please ask buyer for 6-digit code." };
    }

    setListings((prev) =>
      prev.map((l) => (l.id === listingId ? { ...l, status: AuctionStatus.COMPLETED } : l))
    );
    updateDoc(doc(db, "listings", listingId), { status: AuctionStatus.COMPLETED }).catch((e) =>
      handleFirestoreError(e, OperationType.UPDATE, `listings/${listingId}`)
    );

    if (listing.winnerId) {
      triggerNotification(
        listing.winnerId,
        "🤝 Pickup Completed!",
        `Pickup for ${listing.brand} ${listing.model} has been verified by the seller!`,
        "pickup_verified",
        listingId
      );
    }

    triggerNotification(
      listing.sellerId,
      "💚 Transaction Completed!",
      `You successfully verified pickup for ${listing.brand} ${listing.model}.`,
      "pickup_verified",
      listingId
    );

    return { success: true };
  };

  const resolveReport = (reportId: string, action: "delete_listing" | "dismiss") => {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return;

    if (action === "delete_listing") {
      deleteListing(report.listingId);
    }

    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: "resolved" } : r))
    );
    updateDoc(doc(db, "reports", reportId), { status: "resolved" }).catch((e) =>
      handleFirestoreError(e, OperationType.UPDATE, `reports/${reportId}`)
    );
  };

  const blockUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isBlocked: true } : u))
    );
    updateDoc(doc(db, "users", userId), { isBlocked: true }).catch((e) =>
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}`)
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    updateDoc(doc(db, "notifications", id), { isRead: true }).catch((e) =>
      handleFirestoreError(e, OperationType.UPDATE, `notifications/${id}`)
    );
  };

  const clearNotifications = () => {
    notifications
      .filter((n) => n.userId === currentUser.id && !n.isRead)
      .forEach((n) => markNotificationRead(n.id));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        shops,
        listings,
        bids,
        messages,
        reports,
        notifications,
        watchlist,
        signOut,
        isPhoneSignedIn,
        signupUser,
        updateProfile,
        registerShop,
        createListing,
        updateListing,
        deleteListing,
        deleteBid,
        updateBidAmount,
        featureListing,
        incrementViews,
        placeBid,
        buyNow,
        toggleWatchlist,
        sendMessage,
        getChatPartners,
        getMessagesForChat,
        submitReport,
        addShopReview,
        verifySeller,
        verifyShop,
        verifyPickupCode,
        resolveReport,
        blockUser,
        markNotificationRead,
        clearNotifications,
        searchQuery,
        setSearchQuery,
        selectedBrand,
        setSelectedBrand,
        selectedRegion,
        setSelectedRegion,
        selectedStatus,
        setSelectedStatus,
        activeTab,
        setActiveTab,
        brandFilter,
        batteryFilter,
        setBatteryFilter,
        conditionFilter,
        setConditionFilter,
        locationFilter,
        sortOption,
        setSortOption,
        simulateTimeTick,
        isDarkMode,
        toggleTheme
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
