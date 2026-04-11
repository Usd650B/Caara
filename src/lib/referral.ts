import {
  collection, addDoc, getDocs, updateDoc, doc, query, where, Timestamp
} from 'firebase/firestore';
import { getDb } from './firebase';

const REFERRALS_COLLECTION = 'referrals';

export interface Referral {
  id?: string;
  referrerEmail: string;      // Who is inviting
  referrerName: string;
  referralCode: string;        // Unique code like "SHEDOO-NEEMA-7X"
  invitees: InviteeEntry[];    // Up to 5
  discountPercent: number;     // e.g. 15 = 15% off for both parties
  status: 'active' | 'expired';
  createdAt?: Timestamp;
}

export interface InviteeEntry {
  contact: string;             // Email or phone
  name: string;
  sentAt: string;              // ISO timestamp
  redeemed: boolean;
  redeemedAt?: string;
}

// Generate a unique referral code from user name
function generateCode(name: string): string {
  const clean = name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 6) || 'FRIEND';
  const suffix = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `SHEDOO-${clean}-${suffix}`;
}

// Get or create a referral record for a user
export async function getOrCreateReferral(email: string, name: string): Promise<Referral | null> {
  const db = getDb();
  if (!db) return null;

  try {
    // Check if user already has a referral
    const q = query(collection(db, REFERRALS_COLLECTION), where('referrerEmail', '==', email));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const existing = snap.docs[0];
      return { id: existing.id, ...existing.data() } as Referral;
    }

    // Create new referral
    const newReferral: Omit<Referral, 'id'> = {
      referrerEmail: email,
      referrerName: name,
      referralCode: generateCode(name),
      invitees: [],
      discountPercent: 15, // 15% off for both inviter and invitee
      status: 'active',
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, REFERRALS_COLLECTION), newReferral);
    return { id: docRef.id, ...newReferral };
  } catch (error) {
    console.error('Error with referral:', error);
    return null;
  }
}

// Send invitations (add invitees to the referral)
export async function sendInvitations(
  referralId: string,
  newInvitees: { contact: string; name: string }[]
): Promise<{ success: boolean; error?: string }> {
  const db = getDb();
  if (!db) return { success: false, error: 'Database not available' };

  try {
    // Get current referral
    const q = query(collection(db, REFERRALS_COLLECTION), where('__name__', '==', referralId));
    const snap = await getDocs(q);
    if (snap.empty) return { success: false, error: 'Referral not found' };

    const existing = snap.docs[0].data() as Referral;
    const currentInvitees = existing.invitees || [];

    // Check max 5 total
    if (currentInvitees.length + newInvitees.length > 5) {
      return { 
        success: false, 
        error: `You can only invite up to 5 people total. You have ${currentInvitees.length} existing invitations.` 
      };
    }

    // Check for duplicates
    const existingContacts = new Set(currentInvitees.map(i => i.contact.toLowerCase()));
    const duplicates = newInvitees.filter(i => existingContacts.has(i.contact.toLowerCase()));
    if (duplicates.length > 0) {
      return { success: false, error: `These contacts were already invited: ${duplicates.map(d => d.contact).join(', ')}` };
    }

    // Add new invitees
    const entries: InviteeEntry[] = newInvitees.map(inv => ({
      contact: inv.contact,
      name: inv.name,
      sentAt: new Date().toISOString(),
      redeemed: false,
    }));

    await updateDoc(doc(db, REFERRALS_COLLECTION, referralId), {
      invitees: [...currentInvitees, ...entries],
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending invitations:', error);
    return { success: false, error: 'Failed to send invitations' };
  }
}

// Validate a referral code (for invitees using it)
export async function validateReferralCode(code: string): Promise<{ valid: boolean; discount?: number; referrerName?: string }> {
  const db = getDb();
  if (!db) return { valid: false };

  try {
    const q = query(
      collection(db, REFERRALS_COLLECTION),
      where('referralCode', '==', code.toUpperCase()),
      where('status', '==', 'active')
    );
    const snap = await getDocs(q);
    if (snap.empty) return { valid: false };

    const ref = snap.docs[0].data() as Referral;
    return { valid: true, discount: ref.discountPercent, referrerName: ref.referrerName };
  } catch {
    return { valid: false };
  }
}

// Get all referrals (admin view)
export async function getAllReferrals(): Promise<Referral[]> {
  const db = getDb();
  if (!db) return [];

  try {
    const snap = await getDocs(collection(db, REFERRALS_COLLECTION));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Referral));
  } catch {
    return [];
  }
}
