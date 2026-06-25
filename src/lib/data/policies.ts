/**
 * MoveKit Platform Policies
 * Shown during registration and accessible throughout the app.
 */

export const PRIVACY_POLICY = {
  title: "Privacy Policy",
  lastUpdated: "June 2026",
  sections: [
    {
      heading: "What We Collect",
      content: "We collect your name, email, phone number, university details, and location (when you choose to verify). We also store your listings, messages, and deal history.",
    },
    {
      heading: "How We Use Your Data",
      content: "Your data is used to: verify your student identity, match you with relevant listings, compute your trust score, and facilitate secure transactions. We never sell your data to third parties.",
    },
    {
      heading: "What We Share",
      content: "Other users see: your display name, university, trust score, verification badges, and listings. They do NOT see: your email, phone number, or exact location unless you explicitly share it in chat.",
    },
    {
      heading: "Location Data",
      content: "When you verify your location, we only store which city/university you're near — never your exact GPS coordinates. Location verification expires after 90 days.",
    },
    {
      heading: "Messages",
      content: "Chat messages are stored for safety and dispute resolution. Messages are scanned for scam patterns (automated). We do not read your messages unless a dispute is filed.",
    },
    {
      heading: "Account Deletion",
      content: "You can delete your account at any time from Profile settings. This anonymizes your data — your deal history is preserved (for other users' trust records) but all personal info is erased.",
    },
    {
      heading: "Data Security",
      content: "All data is stored in encrypted databases (Supabase). Passwords are hashed with bcrypt. API communication uses HTTPS. We follow industry security standards.",
    },
  ],
}

export const TERMS_OF_SERVICE = {
  title: "Terms of Service",
  lastUpdated: "June 2026",
  sections: [
    {
      heading: "Platform Purpose",
      content: "MoveKit is a peer-to-peer platform connecting university students for item exchange during relocation. We facilitate connections — we do not participate in transactions.",
    },
    {
      heading: "Cash-Only Transactions",
      content: "All transactions on MoveKit are cash-on-meetup. We do not process payments. Never send money in advance to anyone. Never use wire transfers, gift cards, or money orders.",
    },
    {
      heading: "User Responsibility",
      content: "You are responsible for: verifying items before purchase, meeting in safe public locations, and accurately describing items you list. MoveKit is not liable for item quality, condition, or failed meetups.",
    },
    {
      heading: "Trust Score",
      content: "Your trust score reflects your verification status and transaction history. Cancelling deals, receiving disputes, or being warned by admins will reduce your score. You cannot artificially inflate your score.",
    },
    {
      heading: "Prohibited Actions",
      content: "You may not: create fake accounts, list stolen items, harass other users, share others' contact info without consent, attempt to bypass the platform for transactions, or use the platform for non-student purposes.",
    },
    {
      heading: "Meetup Safety",
      content: "We recommend meeting in public campus locations during daylight hours. Use the in-app meetup scheduler. Verify the other person's identity via their profile badges. Trust your instincts — if something feels wrong, cancel.",
    },
    {
      heading: "Disputes",
      content: "If a deal goes wrong, either party can flag it for dispute. An admin will review the chat history and make a decision. Outcomes: deal completed in buyer's favor, seller's favor, or dismissed.",
    },
  ],
}

export const CHAT_SAFETY_NOTES = [
  "💰 All transactions are cash-on-meetup. Never send money in advance.",
  "🔒 Your phone number and email are private until you choose to share them.",
  "📍 Use the meetup scheduler to agree on a safe, public location.",
  "⚠️ Be cautious of offers that seem too good to be true.",
  "🚫 Report any user who pressures you to transact outside the platform.",
  "👥 Meet in public, well-lit campus locations. Bring a friend if possible.",
]

export const DEAL_WARNINGS = {
  propose: "By proposing a deal, you're committing to the listed price. The seller has 48 hours to accept. You can cancel before acceptance with no penalty.",
  accept: "Accepting locks the price and reserves the listing. Both parties must confirm the exchange after meetup. Cancelling an accepted deal will deduct 3 points from your trust score.",
  confirm: "Confirming means you've completed the exchange in person. This action is final and cannot be reversed. Both parties must confirm for the deal to complete.",
  cancel: "Cancelling will return the listing to active status. If the deal was already accepted, you'll lose 3 trust points. This is recorded in your history.",
}
