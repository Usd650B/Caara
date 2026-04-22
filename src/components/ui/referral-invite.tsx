"use client";

import { useState, useEffect } from "react";
import { X, UserPlus, Copy, Check, Gift, Users, ArrowRight, Sparkles, Trash2 } from "lucide-react";
import { Button } from "./button";
import { getOrCreateReferral, sendInvitations, Referral } from "@/lib/referral";
import { getCurrentUser } from "@/lib/customer-auth";
import { openAuthModal } from "./global-auth-modal";

const MAX_INVITES = 5;

export function ReferralInvite({ hideSection = false }: { hideSection?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [referral, setReferral] = useState<Referral | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [invitees, setInvitees] = useState<{ name: string; contact: string }[]>([
    { name: "", contact: "" },
  ]);

  const user = getCurrentUser();
  const slotsUsed = referral?.invitees?.length || 0;
  const slotsRemaining = MAX_INVITES - slotsUsed;

  // Load referral when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setIsLoading(true);
      getOrCreateReferral(user.email, user.name || user.email.split("@")[0])
        .then((ref) => {
          setReferral(ref);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  }, [isOpen, user?.email]);

  const handleOpen = () => {
    if (!user) {
      openAuthModal(undefined, 'open-referral-modal');
      return;
    }
    setIsOpen(true);
  };

  useEffect(() => {
    const handleTrigger = () => handleOpen();
    window.addEventListener('open-referral-modal', handleTrigger);
    return () => window.removeEventListener('open-referral-modal', handleTrigger);
  }, [user]);

  const copyCode = () => {
    if (referral?.referralCode) {
      navigator.clipboard.writeText(referral.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const addRow = () => {
    if (invitees.length + slotsUsed < MAX_INVITES) {
      setInvitees([...invitees, { name: "", contact: "" }]);
    }
  };

  const removeRow = (idx: number) => {
    if (invitees.length > 1) {
      setInvitees(invitees.filter((_, i) => i !== idx));
    }
  };

  const updateRow = (idx: number, field: "name" | "contact", value: string) => {
    const updated = [...invitees];
    updated[idx][field] = value;
    setInvitees(updated);
  };

  const handleSend = async () => {
    if (!referral?.id) return;

    // Validate
    const valid = invitees.filter((i) => i.name.trim() && i.contact.trim());
    if (valid.length === 0) {
      setErrorMsg("Please fill in at least one invitation.");
      return;
    }

    setSending(true);
    setErrorMsg("");
    setSuccessMsg("");

    const result = await sendInvitations(referral.id, valid);

    if (result.success) {
      setSuccessMsg(`🎉 ${valid.length} invitation${valid.length > 1 ? "s" : ""} sent! They'll each get 15% off.`);
      setInvitees([{ name: "", contact: "" }]);
      
      // Sync bonus to localStorage so inviter gets 15% off immediately
      const { syncReferralBonus } = await import("@/lib/bonus");
      await syncReferralBonus(user!.email, user!.name || "");
      
      // Refresh referral
      const updated = await getOrCreateReferral(user!.email, user!.name || "");
      setReferral(updated);
      window.dispatchEvent(new CustomEvent('cart-updated')); // Refresh cart UI if open
    } else {
      setErrorMsg(result.error || "Failed to send invitations.");
    }
    setSending(false);
  };

  return (
    <>
      {/* ═══ Homepage Display Section ═══ */}
      {!hideSection && (
        <section id="offers" className="py-20 px-4 sm:px-8 bg-gradient-to-br from-[var(--brand-primary-50)] via-white to-[var(--brand-accent-50)] relative overflow-hidden">
        {/* Background shapes */}
        <div className="absolute top-10 right-10 w-64 h-64 rounded-full opacity-[0.04] blur-3xl" style={{ background: 'var(--brand-primary)' }} />
        <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full opacity-[0.04] blur-3xl" style={{ background: 'var(--brand-accent)' }} />

        <div className="max-w-screen-xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left — Info */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white border border-[var(--border)] text-[var(--brand-primary)] text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-6 shadow-sm">
                <Gift className="h-3 w-3" />
                Refer & Earn
              </div>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl text-[var(--brand-dark)] tracking-tight leading-tight mb-6"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Invite Friends, <br />
                <span className="text-[var(--brand-primary)]">Get 15% Off</span>
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-md">
                Share the love! Invite up to <strong className="text-[var(--brand-dark)]">5 friends</strong> and
                you'll both receive a <strong className="text-[var(--brand-dark)]">15% discount</strong> on your
                next purchase. It's our way of saying thank you.
              </p>

              {/* How it works — mini steps */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                {[
                  { step: "1", label: "Get your code", icon: Sparkles },
                  { step: "2", label: "Invite up to 5", icon: Users },
                  { step: "3", label: "Both save 15%", icon: Gift },
                ].map(({ step, label, icon: Icon }) => (
                  <div key={step} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-[var(--border)] shadow-sm">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: 'var(--brand-primary)' }}>
                      {step}
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-[var(--brand-accent)]" />
                      <span className="text-xs font-bold text-[var(--brand-dark)]">{label}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleOpen}
                className="inline-flex items-center gap-2 bg-[var(--brand-dark)] text-white px-8 py-4 text-[11px] font-bold uppercase tracking-[0.15em] rounded-lg hover:bg-[var(--brand-primary)] hover:shadow-[0_10px_30px_rgba(232,54,78,0.3)] transition-all duration-300 group"
              >
                <UserPlus className="h-4 w-4" />
                Start Inviting
                <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Right — Visual Card */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-2xl border border-[var(--border)] p-8 shadow-xl max-w-sm ml-auto relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-12 -mt-12 opacity-10 blur-xl" style={{ background: 'var(--brand-primary)' }} />
                                
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold" style={{ background: 'var(--brand-primary)' }}>
                    S
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--brand-dark)]">Sarah M.</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">5 friends invited</p>
                  </div>
                </div>

                <div className="bg-[var(--muted)] rounded-xl p-4 mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mb-1">Referral Code</p>
                    <p className="text-lg font-black tracking-wider text-[var(--brand-dark)]">SHEDOO-SARAH-7X</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-[var(--brand-primary-50)] flex items-center justify-center">
                    <Copy className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                  </div>
                </div>

                <div className="space-y-3">
                  {["Neema K.", "Aisha M.", "Fatima J.", "Grace L.", "Zuwena R."].map((name, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[var(--muted)] flex items-center justify-center text-[10px] font-bold text-gray-500">
                          {name[0]}
                        </div>
                        <span className="text-xs font-medium text-[var(--brand-dark)]">{name}</span>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500">Redeemed</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-5 border-t border-[var(--border)] flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Saved</span>
                  <span className="text-lg font-black text-[var(--brand-primary)]">TSh 47,500</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </section>
      )}

      {/* ═══ INVITATION MODAL ═══ */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-[var(--border)]">
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b border-[var(--border)] rounded-t-2xl">
              <div>
                <h3 className="text-lg font-bold text-[var(--brand-dark)]">Invite Friends</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {slotsRemaining > 0
                    ? `${slotsRemaining} invitation${slotsRemaining !== 1 ? "s" : ""} remaining`
                    : "All 5 invitations used"}
                </p>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-lg hover:bg-[var(--muted)] flex items-center justify-center transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6">
              {isLoading ? (
                <div className="py-12 text-center">
                  <div className="w-8 h-8 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-400">Loading your referral...</p>
                </div>
              ) : (
                <>
                  {/* Referral Code Display */}
                  {referral && (
                    <div className="bg-[var(--muted)] rounded-xl p-4 mb-6 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mb-1">Your Code</p>
                        <p className="text-base font-black tracking-wider text-[var(--brand-dark)]">{referral.referralCode}</p>
                      </div>
                      <button
                        onClick={copyCode}
                        className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-lg border border-[var(--border)] shadow-sm text-xs font-bold hover:border-[var(--brand-primary)] transition-colors"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  )}

                  {/* Existing Invitees */}
                  {referral && referral.invitees.length > 0 && (
                    <div className="mb-6">
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-3">
                        Sent Invitations ({referral.invitees.length}/{MAX_INVITES})
                      </p>
                      <div className="space-y-2">
                        {referral.invitees.map((inv, i) => (
                          <div key={i} className="flex items-center justify-between bg-[var(--muted)] rounded-lg px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: 'var(--brand-accent)' }}>
                                {inv.name[0]?.toUpperCase() || "?"}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-[var(--brand-dark)]">{inv.name}</p>
                                <p className="text-[10px] text-gray-400">{inv.contact}</p>
                              </div>
                            </div>
                            <span className={`text-[9px] font-bold uppercase tracking-widest ${inv.redeemed ? 'text-emerald-500' : 'text-[var(--brand-accent)]'}`}>
                              {inv.redeemed ? "Redeemed" : "Pending"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Invitation Form */}
                  {slotsRemaining > 0 ? (
                    <>
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-3">
                        New Invitations
                      </p>
                      <div className="space-y-3 mb-6">
                        {invitees.map((inv, i) => (
                          <div key={i} className="flex gap-2 items-start">
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder="Friend's name"
                                value={inv.name}
                                onChange={(e) => updateRow(i, "name", e.target.value)}
                                className="h-10 px-3 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/10 transition-all placeholder:text-gray-300"
                              />
                              <input
                                type="text"
                                placeholder="Email or phone"
                                value={inv.contact}
                                onChange={(e) => updateRow(i, "contact", e.target.value)}
                                className="h-10 px-3 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/10 transition-all placeholder:text-gray-300"
                              />
                            </div>
                            {invitees.length > 1 && (
                              <button onClick={() => removeRow(i)} className="w-10 h-10 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors shrink-0">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {invitees.length + slotsUsed < MAX_INVITES && (
                        <button
                          onClick={addRow}
                          className="text-[11px] font-bold text-[var(--brand-primary)] hover:text-[var(--brand-primary-dark)] transition-colors mb-6 flex items-center gap-1.5"
                        >
                          <UserPlus className="h-3 w-3" />
                          Add Another Friend
                        </button>
                      )}

                      {/* Messages */}
                      {errorMsg && (
                        <div className="bg-red-50 text-red-600 text-xs font-medium px-4 py-3 rounded-lg mb-4 border border-red-100">
                          {errorMsg}
                        </div>
                      )}
                      {successMsg && (
                        <div className="bg-emerald-50 text-emerald-600 text-xs font-medium px-4 py-3 rounded-lg mb-4 border border-emerald-100">
                          {successMsg}
                        </div>
                      )}

                      {/* Send Button */}
                      <button
                        onClick={handleSend}
                        disabled={sending}
                        className="w-full h-12 bg-[var(--brand-dark)] text-white text-[11px] font-bold uppercase tracking-[0.15em] rounded-lg hover:bg-[var(--brand-primary)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {sending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Gift className="h-4 w-4" />
                            Send Invitations
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                        <Check className="h-5 w-5 text-emerald-500" />
                      </div>
                      <p className="text-sm font-bold text-[var(--brand-dark)] mb-1">All invitations sent!</p>
                      <p className="text-xs text-gray-400">You've used all 5 invitations. Thank you for spreading the word!</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
