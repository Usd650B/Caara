"use client"

import { useSettings } from "@/lib/settings";
import { ArrowLeft, Book } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
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
          <div className="absolute top-0 left-0 w-32 h-32 bg-secondary/5 rounded-full -ml-16 -mt-16 blur-3xl"></div>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center shadow-lg">
              <Book className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
              {t("Terms of Service")}
            </h1>
          </div>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-600 font-light leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-black uppercase tracking-widest text-sm mb-4">1. {t("Acceptance of Terms")}</h2>
              <p>
                By accessing <span className="font-bold text-black">CARA</span>, you agree to these terms. Our atelier provides curated fashion and accessories, and your use of our platform constitutes agreement to our operating guidelines.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black uppercase tracking-widest text-sm mb-4">2. {t("User Conduct")}</h2>
              <p>
                Users are expected to provide accurate information during checkout and authentication. Any attempt to disrupt the platform's security or integrity is strictly prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black uppercase tracking-widest text-sm mb-4">3. {t("Intellectual Property")}</h2>
              <p>
                All brand identity, designs, and content displayed on CARA are our exclusive property. These cannot be reproduced or redistributed without our prior written consent.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black uppercase tracking-widest text-sm mb-4">4. {t("Order Fulfillment")}</h2>
              <p>
                All orders are subject to availability. Shipping and delivery times are estimates based on standard international courier performance. Every effort is made to ensure timely delivery of your selections.
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
