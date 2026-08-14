/**
 * Global Application Configuration Flags
 *
 * When TRIAL_MODE is true, the application operates in private trial mode:
 * 1. Buyer-facing Google/phone sign-in entry points are hidden from Navigation.
 * 2. Attempts by guests to place bids, buy now, or add to watchlist display a clear message
 *    ("Bidding opens soon — check back shortly") via SignupModal instead of showing a buyer registration form.
 * 3. Admin sign-in options remain fully functional.
 *
 * Set TRIAL_MODE to false to restore standard buyer registration & sign-in features.
 */
export const TRIAL_MODE = true;
