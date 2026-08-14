/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile, ShopProfile, PhoneListing, Bid, ChatMessage, Report, UserRole, AuctionStatus, PhoneCondition } from "../types";

// Helper to generate ISO dates relative to now
const getDateOffset = (hoursOffset: number): string => {
  const d = new Date();
  d.setMinutes(d.getMinutes() + hoursOffset * 60);
  return d.toISOString();
};

export const initialUsers: UserProfile[] = [
  {
    id: "user-admin",
    name: "YONIMobile Admin",
    email: "admin@yonimobile.com",
    phone: "+251911234567",
    role: UserRole.ADMIN,
    location: {
      region: "Addis Ababa",
      city: "Addis Ababa",
      subCity: "Bole",
      address: "Bole Olympia Plaza, Ground floor shop #4"
    },
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    rating: 5.0,
    reviewCount: 42,
    isVerifiedSeller: true,
    joinedDate: "2024-01-01T00:00:00Z"
  },
  {
    id: "user-buyer-1",
    name: "Tilahun Kebede (Buyer / Bidder)",
    email: "tilahun.kebede@gmail.com",
    phone: "+251912345678",
    role: UserRole.BUYER,
    location: {
      region: "Addis Ababa",
      city: "Addis Ababa",
      subCity: "Kirkos",
      address: "Near Mexico Square, Ward 2"
    },
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    rating: 4.8,
    reviewCount: 15,
    isVerifiedSeller: false,
    joinedDate: "2024-10-15T12:00:00Z"
  }
];

export const initialShops: ShopProfile[] = [
  {
    id: "shop-1",
    ownerId: "user-admin",
    name: "Yared & Sons Mobile Plaza",
    logoUrl: "https://images.unsplash.com/photo-1555421689-491a97ff2040?w=150&auto=format&fit=crop&q=80",
    description: "Your premier destination for high-quality, verified used and open-box smartphones. Located at Bole Olympia. We provide 1-month shop warranty on all auction items.",
    phone: "+251911445566",
    location: {
      region: "Addis Ababa",
      city: "Addis Ababa",
      subCity: "Bole",
      address: "Bole Road, Olympia Building, Ground Floor"
    },
    rating: 4.9,
    isVerified: true,
    bannerColor: "from-blue-600 to-indigo-800",
    reviews: [
      {
        id: "r-1",
        reviewerName: "Bruk Lemma",
        rating: 5,
        comment: "Excellent service. Won an iPhone 13 Pro, inspected it in shop, battery was exactly 88% as stated. Best verified seller!",
        createdAt: "2026-06-15T09:00:00Z"
      },
      {
        id: "r-2",
        reviewerName: "Selamawit Hailu",
        rating: 5,
        comment: "Very professional shop. Highly recommended. Fast transaction using Telebirr.",
        createdAt: "2026-07-02T14:30:00Z"
      }
    ]
  },
  {
    id: "shop-2",
    ownerId: "user-admin",
    name: "Sheger Mobile Center",
    logoUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=80",
    description: "Specialized in importing clean premium smartphones. We offer cash, CBE Birr, and Telebirr payment methods. Every smartphone has its IMEI verified by Ethio Telecom guidelines.",
    phone: "+251912998877",
    location: {
      region: "Addis Ababa",
      city: "Addis Ababa",
      subCity: "Kirkos",
      address: "Kirkos, Near Mexico Square, Stadium Area Shop #14"
    },
    rating: 4.7,
    isVerified: true,
    bannerColor: "from-emerald-600 to-teal-800",
    reviews: [
      {
        id: "r-3",
        reviewerName: "Mulugeta Assefa",
        rating: 4,
        comment: "Great experience buying a Galaxy S23. The shop was crowded but the phone condition is perfect.",
        createdAt: "2026-05-20T11:45:00Z"
      }
    ]
  }
];

export const initialListings: PhoneListing[] = [
  {
    id: "listing-iphone15",
    sellerId: "user-admin",
    shopId: "shop-1",
    brand: "Apple",
    model: "iPhone 15 Pro Max",
    storage: "256GB",
    ram: "8GB",
    batteryHealth: 94,
    condition: PhoneCondition.EXCELLENT,
    conditionDetails: "No scratches on screen, minor wear on charging port. FaceID active, TrueTone active. Single SIM + eSIM.",
    imei: "358249221049281",
    isImeiVerified: true,
    accessories: ["Original Box", "Type-C Cable", "Silicone Case"],
    images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1695048132853-2704bc1b1c3e?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1695048132717-3841ec2ea7b5?w=600&auto=format&fit=crop&q=80"
    ],
    startingBid: 115000,
    currentBid: 124000,
    minIncrement: 1000,
    buyNowPrice: 135000,
    sellerLocation: {
      region: "Addis Ababa",
      city: "Addis Ababa",
      subCity: "Bole",
      address: "Bole Olympia Plaza, Ground floor shop #4"
    },
    status: AuctionStatus.LIVE,
    startTime: getDateOffset(-24), // Started 24 hours ago
    endTime: getDateOffset(4), // Ends in 4 hours
    createdAt: getDateOffset(-24),
    views: 312,
    isFeatured: true,
    reportsCount: 0
  },
  {
    id: "listing-s24ultra",
    sellerId: "user-admin",
    shopId: "shop-2",
    brand: "Samsung",
    model: "Galaxy S24 Ultra",
    storage: "512GB",
    ram: "12GB",
    batteryHealth: 98,
    condition: PhoneCondition.EXCELLENT,
    conditionDetails: "Like new. Titanium Black. Includes S-Pen. Factory unlocked. Gorgeous 120Hz AMOLED screen.",
    imei: "359928114092812",
    isImeiVerified: true,
    accessories: ["Original Charger", "Fast Cable", "Premium Ringke Case"],
    images: [
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80"
    ],
    startingBid: 120000,
    currentBid: 129500,
    minIncrement: 1500,
    buyNowPrice: 140000,
    sellerLocation: {
      region: "Addis Ababa",
      city: "Addis Ababa",
      subCity: "Kirkos",
      address: "Kirkos subcity, near Stadium, Sheger Plaza Shop 10"
    },
    status: AuctionStatus.LIVE,
    startTime: getDateOffset(-12),
    endTime: getDateOffset(18), // Ends in 18 hours
    createdAt: getDateOffset(-12),
    views: 184,
    isFeatured: true,
    reportsCount: 0
  },
  {
    id: "listing-pixel8",
    sellerId: "user-admin",
    brand: "Google",
    model: "Pixel 8 Pro",
    storage: "128GB",
    ram: "12GB",
    batteryHealth: 89,
    condition: PhoneCondition.VERY_GOOD,
    conditionDetails: "Bay Blue color. Minor pocket marks on metal frame. Camera lens pristine. Android 14 operating smoothly.",
    imei: "354029112948271",
    isImeiVerified: true,
    accessories: ["Type-C Cable", "Protective Clear Case"],
    images: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80"
    ],
    startingBid: 62000,
    currentBid: 65000,
    minIncrement: 500,
    sellerLocation: {
      region: "Oromia",
      city: "Adama",
      subCity: "Kebele 02",
      address: "Main bus station highway road, behind Commercial Bank"
    },
    status: AuctionStatus.LIVE,
    startTime: getDateOffset(-3),
    endTime: getDateOffset(29), // Ends tomorrow
    createdAt: getDateOffset(-3),
    views: 45,
    isFeatured: false,
    reportsCount: 0
  },
  {
    id: "listing-iphone13",
    sellerId: "user-admin",
    shopId: "shop-1",
    brand: "Apple",
    model: "iPhone 13 Pro",
    storage: "128GB",
    ram: "6GB",
    batteryHealth: 84,
    condition: PhoneCondition.GOOD,
    conditionDetails: "Graphite color. Some small paint chipping near edges. Screen is pristine with screen guard. Fully functional.",
    imei: "357281002938174",
    isImeiVerified: true,
    accessories: ["Original Box"],
    images: [
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80"
    ],
    startingBid: 52000,
    currentBid: 56500,
    minIncrement: 500,
    buyNowPrice: 61000,
    sellerLocation: {
      region: "Addis Ababa",
      city: "Addis Ababa",
      subCity: "Bole",
      address: "Bole Olympia Plaza, Ground floor shop #4"
    },
    status: AuctionStatus.LIVE,
    startTime: getDateOffset(-48),
    endTime: getDateOffset(1.5), // Ends in 1.5 hours!
    createdAt: getDateOffset(-48),
    views: 412,
    isFeatured: false,
    reportsCount: 0
  },
  {
    id: "listing-redminote13",
    sellerId: "user-admin",
    shopId: "shop-2",
    brand: "Xiaomi",
    model: "Redmi Note 13 Pro 5G",
    storage: "256GB",
    ram: "8GB",
    batteryHealth: 96,
    condition: PhoneCondition.EXCELLENT,
    conditionDetails: "Used for 1 week only. Selling to upgrade. Complete set. 200MP camera is highly impressive.",
    imei: "863920112948192",
    isImeiVerified: true,
    accessories: ["Original Box", "67W Charger", "Type-C Cable", "Silicone Case"],
    images: [
      "https://images.unsplash.com/photo-1565849320607-11ed3ead930a?w=600&auto=format&fit=crop&q=80"
    ],
    startingBid: 21000,
    currentBid: 23000,
    minIncrement: 500,
    buyNowPrice: 25500,
    sellerLocation: {
      region: "Addis Ababa",
      city: "Addis Ababa",
      subCity: "Kirkos",
      address: "Kirkos subcity, near Stadium, Sheger Plaza Shop 10"
    },
    status: AuctionStatus.LIVE,
    startTime: getDateOffset(-6),
    endTime: getDateOffset(48), // Ends in 2 days
    createdAt: getDateOffset(-6),
    views: 89,
    isFeatured: false,
    reportsCount: 0
  },
  {
    id: "listing-upcoming-s23",
    sellerId: "user-admin",
    shopId: "shop-2",
    brand: "Samsung",
    model: "Galaxy S23 FE",
    storage: "128GB",
    ram: "8GB",
    batteryHealth: 91,
    condition: PhoneCondition.VERY_GOOD,
    conditionDetails: "Clean phone, single user. Screen protector and bumper case applied since day 1.",
    imei: "354928110294817",
    isImeiVerified: false, // Under verification
    accessories: ["Cable"],
    images: [
      "https://images.unsplash.com/photo-1573148195900-7845dcb9b127?w=600&auto=format&fit=crop&q=80"
    ],
    startingBid: 38000,
    currentBid: 38000,
    minIncrement: 500,
    sellerLocation: {
      region: "Addis Ababa",
      city: "Addis Ababa",
      subCity: "Kirkos",
      address: "Kirkos subcity, near Stadium, Sheger Plaza Shop 10"
    },
    status: AuctionStatus.UPCOMING,
    startTime: getDateOffset(2), // Starts in 2 hours
    endTime: getDateOffset(50),
    createdAt: getDateOffset(-1),
    views: 12,
    isFeatured: false,
    reportsCount: 0
  },
  {
    id: "listing-ended-iphone14",
    sellerId: "user-admin",
    shopId: "shop-1",
    brand: "Apple",
    model: "iPhone 14 Pro",
    storage: "128GB",
    ram: "6GB",
    batteryHealth: 86,
    condition: PhoneCondition.VERY_GOOD,
    conditionDetails: "Deep Purple, immaculate body. Face ID is responsive. Ready for pick-up.",
    imei: "351120492810293",
    isImeiVerified: true,
    accessories: ["Original Box", "Spigen Tough Armor Case"],
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80"
    ],
    startingBid: 72000,
    currentBid: 84000,
    minIncrement: 1000,
    sellerLocation: {
      region: "Addis Ababa",
      city: "Addis Ababa",
      subCity: "Bole",
      address: "Bole Olympia Plaza, Ground floor shop #4"
    },
    status: AuctionStatus.ENDED,
    startTime: getDateOffset(-50),
    endTime: getDateOffset(-2), // Ended 2 hours ago
    winnerId: "user-admin", // Active user won this!
    pickupCode: "824915",
    createdAt: getDateOffset(-50),
    views: 310,
    isFeatured: false,
    reportsCount: 0
  },
  {
    id: "listing-completed-s22",
    sellerId: "user-admin",
    shopId: "shop-2",
    brand: "Samsung",
    model: "Galaxy S22 5G",
    storage: "128GB",
    ram: "8GB",
    batteryHealth: 82,
    condition: PhoneCondition.GOOD,
    conditionDetails: "Perfect secondary phone. Minor pocket scuffs, screen has zero scratches.",
    imei: "354928114029410",
    isImeiVerified: true,
    accessories: ["Generic Charger"],
    images: [
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80"
    ],
    startingBid: 28000,
    currentBid: 32500,
    minIncrement: 500,
    sellerLocation: {
      region: "Addis Ababa",
      city: "Addis Ababa",
      subCity: "Kirkos",
      address: "Kirkos subcity, near Stadium, Sheger Plaza Shop 10"
    },
    status: AuctionStatus.COMPLETED,
    startTime: getDateOffset(-120),
    endTime: getDateOffset(-72),
    winnerId: "user-admin",
    pickupCode: "109384",
    createdAt: getDateOffset(-120),
    views: 154,
    isFeatured: false,
    reportsCount: 0
  }
];

export const initialBids: Bid[] = [
  {
    id: "bid-1",
    listingId: "listing-iphone15",
    bidderId: "user-admin", // Active user
    bidderName: "Yared Abegaz",
    amount: 118000,
    timestamp: getDateOffset(-18)
  },
  {
    id: "bid-2",
    listingId: "listing-iphone15",
    bidderId: "bidder-rival-1",
    bidderName: "Dawit Abebe",
    amount: 120000,
    timestamp: getDateOffset(-12)
  },
  {
    id: "bid-3",
    listingId: "listing-iphone15",
    bidderId: "user-buyer-1", // Active user
    bidderName: "Tilahun Kebede",
    amount: 122000,
    timestamp: getDateOffset(-6)
  },
  {
    id: "bid-4",
    listingId: "listing-iphone15",
    bidderId: "bidder-rival-2",
    bidderName: "Tigist Hailu",
    amount: 124000,
    timestamp: getDateOffset(-1)
  },
  {
    id: "bid-5",
    listingId: "listing-s24ultra",
    bidderId: "bidder-rival-1",
    bidderName: "Dawit Abebe",
    amount: 125000,
    timestamp: getDateOffset(-10)
  },
  {
    id: "bid-6",
    listingId: "listing-s24ultra",
    bidderId: "bidder-rival-3",
    bidderName: "Kaleb Lemma",
    amount: 128000,
    timestamp: getDateOffset(-5)
  },
  {
    id: "bid-7",
    listingId: "listing-s24ultra",
    bidderId: "bidder-rival-1",
    bidderName: "Dawit Abebe",
    amount: 129500,
    timestamp: getDateOffset(-2)
  },
  {
    id: "bid-8",
    listingId: "listing-iphone13",
    bidderId: "bidder-rival-2",
    bidderName: "Tigist Hailu",
    amount: 54000,
    timestamp: getDateOffset(-30)
  },
  {
    id: "bid-9",
    listingId: "listing-iphone13",
    bidderId: "user-buyer-1", // Active user bid
    bidderName: "Tilahun Kebede",
    amount: 55500,
    timestamp: getDateOffset(-12)
  },
  {
    id: "bid-10",
    listingId: "listing-iphone13",
    bidderId: "bidder-rival-3",
    bidderName: "Kaleb Lemma",
    amount: 56500,
    timestamp: getDateOffset(-1)
  },
  {
    id: "bid-11",
    listingId: "listing-redminote13",
    bidderId: "bidder-rival-2",
    bidderName: "Tigist Hailu",
    amount: 22000,
    timestamp: getDateOffset(-4)
  },
  {
    id: "bid-12",
    listingId: "listing-redminote13",
    bidderId: "bidder-rival-1",
    bidderName: "Dawit Abebe",
    amount: 23000,
    timestamp: getDateOffset(-1)
  },
  {
    id: "bid-13",
    listingId: "listing-ended-iphone14",
    bidderId: "bidder-rival-1",
    bidderName: "Dawit Abebe",
    amount: 78000,
    timestamp: getDateOffset(-24)
  },
  {
    id: "bid-14",
    listingId: "listing-ended-iphone14",
    bidderId: "user-buyer-1", // Active user won!
    bidderName: "Tilahun Kebede",
    amount: 84000,
    timestamp: getDateOffset(-4)
  }
];

export const initialMessages: ChatMessage[] = [
  {
    id: "msg-1",
    senderId: "user-buyer-1",
    receiverId: "user-admin",
    listingId: "listing-iphone15",
    text: "Hello, does the shop offer any exchange deals as well?",
    createdAt: getDateOffset(-2)
  },
  {
    id: "msg-2",
    senderId: "user-admin",
    receiverId: "user-buyer-1",
    listingId: "listing-iphone15",
    text: "Hello! Yes, we can evaluate your old phone in person and deduct its value if you win the auction.",
    createdAt: getDateOffset(-1.8)
  },
  {
    id: "msg-3",
    senderId: "user-buyer-1",
    receiverId: "user-admin",
    listingId: "listing-ended-iphone14",
    text: "Hi, I just won this iPhone 14 Pro auction! Can I come collect it tomorrow at 10 AM?",
    createdAt: getDateOffset(-1.5)
  },
  {
    id: "msg-4",
    senderId: "user-admin",
    receiverId: "user-buyer-1",
    listingId: "listing-ended-iphone14",
    text: "Congratulations! Yes, our Olympia shop is open from 8:30 AM to 7:00 PM. Please bring your 6-digit confirmation code shown on your won listings tab. See you tomorrow!",
    createdAt: getDateOffset(-1)
  }
];

export const initialReports: Report[] = [
  {
    id: "rep-1",
    listingId: "listing-pixel8",
    listingTitle: "Google Pixel 8 Pro 128GB",
    reporterId: "user-buyer-1",
    reporterName: "Tilahun Kebede",
    reason: "Suspicious Listing Description",
    details: "The price seems fine, but the user listing states it is in Hawassa but their profile says Adama. Just want to flag to make sure IMEI matches.",
    status: "pending",
    createdAt: getDateOffset(-1)
  }
];
