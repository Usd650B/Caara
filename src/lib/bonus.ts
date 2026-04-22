/**
 * Bonus System — manages signup bonus (10%) and referral bonus (15%)
 * Stores bonus state in localStorage for client-side discount application.
 */

const SIGNUP_BONUS_KEY = 'shedoo_signup_bonus';
const REFERRAL_BONUS_KEY = 'shedoo_referral_bonus';
const INVITE_PROMPT_KEY = 'shedoo_invite_prompt_dismissed';

// ─── Signup Bonus (10%) ───

export function grantSignupBonus() {
  if (typeof window === 'undefined') return;
  // Only grant once — check if they already used it
  const existing = localStorage.getItem(SIGNUP_BONUS_KEY);
  if (existing) return; // Already has it
  localStorage.setItem(SIGNUP_BONUS_KEY, JSON.stringify({
    percent: 10,
    granted: new Date().toISOString(),
    used: false,
  }));
}

export function getSignupBonus(): { percent: number; used: boolean } | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(SIGNUP_BONUS_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch { return null; }
}

export function markSignupBonusUsed() {
  if (typeof window === 'undefined') return;
  const bonus = getSignupBonus();
  if (bonus) {
    localStorage.setItem(SIGNUP_BONUS_KEY, JSON.stringify({ ...bonus, used: true }));
  }
}

// ─── Referral Bonus (15%) ───

export function applyReferralCode(code: string, referrerName: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REFERRAL_BONUS_KEY, JSON.stringify({
    code,
    referrerName,
    percent: 15,
    applied: new Date().toISOString(),
    used: false,
  }));
}

export function getReferralBonus(): { code: string; referrerName: string; percent: number; used: boolean } | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(REFERRAL_BONUS_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch { return null; }
}

export function clearReferralBonus() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(REFERRAL_BONUS_KEY);
}

export function markReferralBonusUsed() {
  if (typeof window === 'undefined') return;
  const bonus = getReferralBonus();
  if (bonus) {
    localStorage.setItem(REFERRAL_BONUS_KEY, JSON.stringify({ ...bonus, used: true }));
  }
}

/**
 * Sync referral status from Firestore to localStorage
 * This ensures that if the user is an inviter, they get their 15% bonus.
 */
export async function syncReferralBonus(email: string, name: string) {
  if (typeof window === 'undefined') return;
  
  try {
    const { getOrCreateReferral } = await import('./referral');
    const referral = await getOrCreateReferral(email, name);
    
    if (referral && referral.invitees.length > 0) {
      // User has invited someone, give them the inviter bonus
      const existing = getReferralBonus();
      if (!existing || (!existing.used && existing.percent < 15)) {
        localStorage.setItem(REFERRAL_BONUS_KEY, JSON.stringify({
          code: referral.referralCode,
          referrerName: "System (Inviter Bonus)",
          percent: 15,
          applied: new Date().toISOString(),
          used: existing?.used || false,
        }));
      }
    }
  } catch (error) {
    console.error('Failed to sync referral bonus:', error);
  }
}

// ─── Invite Prompt ───

export function shouldShowInvitePrompt(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(INVITE_PROMPT_KEY) !== 'true';
}

export function dismissInvitePrompt() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(INVITE_PROMPT_KEY, 'true');
}

// ─── Discount Calculation ───

export function calculateBonusDiscount(subtotal: number): {
  signupDiscount: number;
  referralDiscount: number;
  totalDiscount: number;
  appliedBonuses: string[];
} {
  let signupDiscount = 0;
  let referralDiscount = 0;
  const appliedBonuses: string[] = [];

  const signup = getSignupBonus();
  if (signup && !signup.used) {
    signupDiscount = subtotal * (signup.percent / 100);
    appliedBonuses.push(`Sign-up bonus (${signup.percent}% off)`);
  }

  const referral = getReferralBonus();
  if (referral && !referral.used) {
    referralDiscount = subtotal * (referral.percent / 100);
    appliedBonuses.push(`Referral bonus (${referral.percent}% off)`);
  }

  // Only use the best discount, not both
  if (referralDiscount > signupDiscount) {
    signupDiscount = 0;
    appliedBonuses.splice(0, appliedBonuses.indexOf(`Sign-up bonus`));
  } else if (signupDiscount > 0) {
    referralDiscount = 0;
  }

  const totalDiscount = signupDiscount + referralDiscount;

  return { signupDiscount, referralDiscount, totalDiscount, appliedBonuses };
}

// Best discount only
export function getBestDiscount(subtotal: number): {
  amount: number;
  percent: number;
  label: string;
  type: 'signup' | 'referral' | 'none';
} {
  const signup = getSignupBonus();
  const referral = getReferralBonus();

  const signupPercent = (signup && !signup.used) ? signup.percent : 0;
  const referralPercent = (referral && !referral.used) ? referral.percent : 0;

  if (referralPercent >= signupPercent && referralPercent > 0) {
    return {
      amount: subtotal * (referralPercent / 100),
      percent: referralPercent,
      label: `Referral bonus — ${referralPercent}% off`,
      type: 'referral',
    };
  }

  if (signupPercent > 0) {
    return {
      amount: subtotal * (signupPercent / 100),
      percent: signupPercent,
      label: `Sign-up bonus — ${signupPercent}% off`,
      type: 'signup',
    };
  }

  return { amount: 0, percent: 0, label: '', type: 'none' };
}
