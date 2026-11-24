# Stampo ☕ Digital Loyalty Stamp Card

A loyalty-card app for independent coffee shops. Customers sign up, show a QR code at the till and collect stamps towards rewards. Shops scan the code to give a stamp, but only once an admin has approved the shop.

I designed the **PostgreSQL database** (on Supabase) behind it, with the business rules enforced inside the database itself: row-level security, database functions and SQL migrations.

> **Portfolio:** [rsts24.github.io](https://rsts24.github.io) · **Author:** Ritesh Shetty · [LinkedIn](https://www.linkedin.com/in/rks258)

---

## What it does

| For customers | For coffee shops (vendors) | For admins |
|---|---|---|
| Sign up with email and password (or phone and a one-time code) | Separate vendor login and dashboard | Approve or deny new shops |
| Personal QR code to show at the till | Scan a customer's QR code to give a stamp | Mark rewards as redeemed |
| Track stamps and progress towards rewards (6 stamps from one shop = 1 reward) | Shop profile with logo | |
| Claim rewards: free coffee, birthday rewards and crypto/share rewards | Can only stamp after approval | |
| Manage profile, preferences, or delete the account | | |

---

## Database design

8 tables in the `public` schema, all with **Row Level Security** turned on.

```
auth.users ─┬─< profiles            (1:1 customer details)
            ├─< vendors ─┬─< stamps >── auth.users
            │            ├─< rewards >── auth.users
            │            ├─< transactions >── auth.users
            │            └─< vendor_subscriptions >── subscription_packages
            └─< admins
```

| Table | Purpose | Key columns |
|---|---|---|
| `profiles` | Customer details | full_name, date_of_birth, mobile_number, preferred_language, notification_preferences |
| `vendors` | Coffee shops | user_id, business_name, address |
| `stamps` | One row per stamp collected | user_id, vendor_id, collected_at |
| `rewards` | Rewards claimed and redeemed | customer_id, vendor_id, type, status, stamps_used, crypto_amount_in_pence |
| `transactions` | Purchases and platform fees | amount_in_pence, fee_percentage, fee_amount_in_pence, stamps_earned |
| `subscription_packages` | Vendor plans | tier, duration_months, price_in_pence, transaction_fee_percentage |
| `vendor_subscriptions` | Which shop is on which plan | vendor_id, package_id, status, start_date, end_date |
| `admins` | Admin users | user_id |

Money is stored as **integer pence**, never floats, so there are no rounding errors.

### Business rules enforced in the database

Rules live in PostgreSQL, so no one can get around them from the browser:

- **22 row-level security policies:** for example, customers see only their own stamps, and shops see only the stamps they gave.
- **Database functions for every sensitive action:** `give_stamp`, `claim_reward`, `redeem_reward`, `set_vendor_approval`, `deny_vendor`, `request_vendor_review` and `delete_my_account`.
- **Only approved vendors can give stamps,** and only to customers with a **confirmed email or phone number**, so made-up accounts can't collect stamps.
- **Rewards can only be used at the shop that gave the stamps.** A shop that fakes stamps can only give away its own coffee, so there's nothing to gain from cheating.
- **7 triggers** handle housekeeping, such as creating a profile on sign-up and updating `updated_at` timestamps.

### Migrations

The schema was built step by step through **12 SQL migrations** in [`supabase/migrations`](supabase/migrations), each one a single feature or security fix:

| Migration | Change |
|---|---|
| `initial_schema` | Core tables, relationships and RLS |
| `stamps_vendor_only` | Only vendors can create stamps |
| `stamps_require_verified_phone` | Stamps need a verified account |
| `lock_down_functions` | Restricted who can call database functions |
| `vendor_approval` | Admin approval before a shop goes live |
| `rewards_redeem_admin` | Admin redemption of rewards |
| `rewards_home_shop` | Rewards only usable at the shop that gave the stamps |
| `reward_type_birthday` | Birthday reward type |
| `vendor_profiles` | Shop profile details |
| `shop_logo_storage` | Storage for shop logos |
| `vendor_deny` | Admins can deny a shop application |
| `email_customers` | Email and password sign-up (cheaper than text codes); confirmed email or phone required to collect stamps |

---

## Tech stack

| Layer | Tools |
|---|---|
| Database & auth | Supabase (PostgreSQL), Row Level Security, email and phone sign-in |
| Front end | React, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| QR codes | `qrcode.react` (show code), `@yudiel/react-qr-scanner` (scan code) |
| Data & forms | TanStack Query, React Hook Form, Zod |
| Built with | [Lovable](https://lovable.dev) (AI app builder), with the schema and rules designed and checked by me |

---

## Running it locally

```bash
git clone https://github.com/Rsts24/stampo-crypto-buddy.git
cd stampo-crypto-buddy
npm install
# Create a .env file with your own Supabase project:
#   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
#   VITE_SUPABASE_ANON_KEY=your-anon-key
npm run dev
```

To set up the database, run the files in `supabase/migrations` in order. The Supabase CLI does this with `supabase db push`.

---

*Personal project by Ritesh Shetty. The Supabase anon key used by the app is public by design. All data access is controlled by row-level security.*
