import { RewardType } from "@/types/rewards";

// One place for the stamp card rules, so every page agrees.
export const TOTAL_STAMPS = 15;

// Stamps expire this many months after they are collected.
export const STAMP_VALIDITY_MONTHS = 6;

export const REWARD_TIERS: { type: RewardType; stamps: number }[] = [
  { type: "coffee", stamps: 6 },
  { type: "crypto", stamps: 10 },
  { type: "both", stamps: 15 },
];

/** The next reward threshold above the current stamp count, or null if all are unlocked. */
export const getNextMilestone = (stamps: number): number | null => {
  const next = REWARD_TIERS.find((tier) => stamps < tier.stamps);
  return next ? next.stamps : null;
};
