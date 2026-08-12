# Firebase Firestore Security Specification & Testing Protocol

## Data Invariants
1. **User Identity & Auth Alignment**: Each user profile document `/users/{userId}` can only be created or modified by the authenticated user matching `{userId}` or an Admin.
2. **Auction Integrity**: Bids must be placed by authenticated users for live auctions, with amounts exceeding current bids.
3. **Listings Control**: Sellers or Admins can create listings. Only the listing seller or admin can edit listing details.
4. **Shops Ownership**: Only shop owners or admins can modify shop profiles.
5. **Notification & Message Privacy**: Notifications and direct messages are only readable/writable by involved participants.

## The "Dirty Dozen" Security Payloads (Negative Tests)
1. **Unauthenticated Write**: Creating a listing without an `auth` token.
2. **Identity Spoofing**: User A creating a bid under User B's `bidderId`.
3. **User Profile Hijack**: User A editing User B's `/users/{userId}` document.
4. **Invalid Role Self-Assignment**: Regular buyer setting `role: "admin"` during sign-up.
5. **Excessive String Injection**: Injecting a 50KB payload into `brand` or `model`.
6. **Negative/Zero Bid Exploits**: Submitting a bid of 0 ETB or negative ETB.
7. **Bypassing Terminal States**: Modifying a listing that has `status: "completed"`.
8. **Unauthorized Shop Modification**: Non-owner editing shop details.
9. **Chat Eavesdropping**: User C attempting to read direct messages between User A and User B.
10. **Malicious Notification Injection**: Sending fake system notifications to arbitrary users.
11. **Report Tampering**: Modifying an existing abuse report status without admin privileges.
12. **Immutable Field Alteration**: Overwriting `createdAt` or `sellerId` on an existing listing.
