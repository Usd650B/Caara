"use client"

import { useSettings } from "@/lib/settings";
import { ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  const { t } = useSettings();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="hover:bg-white/50">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("Back to Store")}
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-2xl border border-gray-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
              {t("Privacy Policy")}
            </h1>
          </div>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-600 font-light leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-black uppercase tracking-widest text-sm mb-4">1. {t("Our Commitment")}</h2>
              <p>
                At <span className="font-bold text-black">CARA</span>, your privacy is a cornerstone of our service. This policy outlines how we handle your information with the same care and excellence we bring to our collections.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black uppercase tracking-widest text-sm mb-4">2. {t("Information We Collect")}</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Personal identifiers (name, email, shipping address) provided during checkout or authentication.</li>
                <li>Transactional data for order fulfillment and tracking.</li>
                <li>Device information and cookies to enhance your shopping experience.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black uppercase tracking-widest text-sm mb-4">3. {t("How We Use Your Data")}</h2>
              <p>
                Your information is used exclusively to facilitate your orders, personalize your experience, and communicate important updates regarding your selections. We do not sell your personal data to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black uppercase tracking-widest text-sm mb-4">4. {t("Security")}</h2>
              <p>
                We implement bank-grade encryption and secure authentication via Google to ensure your data remains protected within our digital atelier.
              </p>
            </section>

            <p className="pt-8 text-xs italic text-gray-400">
              Last updated: March 19, 2026. For inquiries, please contact our concierge.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
