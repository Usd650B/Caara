"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User, Mail, Phone, MapPin, Package, Heart, 
  Settings, LogOut, ChevronRight, ArrowLeft,
  Shield, CreditCard, Bell, Sparkles, Diamond,
  Camera, Edit2, Save, X
} from "lucide-react";
import Link from "next/link";
import { getCurrentUser, signOutCustomer } from "@/lib/customer-auth";
import { useSettings } from "@/lib/settings";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { t } = useSettings();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        router.push("/");
        return;
      }
      setUser(currentUser);
      setIsLoading(false);
    };
    checkAuth();
  }, [router]);

  const handleSignOut = () => {
    signOutCustomer();
    router.push("/");
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const ProfileCard = ({ title, icon: Icon, children, badge }: any) => (
    <div className="bg-white rounded-3xl border border-black/5 p-8 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
        <Icon className="h-20 w-20" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
           <h3 className="text-sm font-semibold uppercase tracking-widest text-black/40">{title}</h3>
           {badge && <span className="px-3 py-1 bg-primary/10 text-primary rounded-md text-[10px] font-bold uppercase tracking-widest">{badge}</span>}
        </div>
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 md:py-24">
        {/* Navigation */}
        <div className="mb-8">
           <Link href="/" className="group inline-flex items-center text-xs font-semibold uppercase tracking-widest text-black/40 hover:text-black transition-colors">
             <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
             Return Home
           </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Identity Node */}
          <div className="lg:col-span-8 space-y-8">
             <section className="relative h-64 rounded-3xl overflow-hidden bg-black flex items-center p-8 group">
                <div className="absolute inset-0 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100">
                  <img 
                    src="/hero_fashion_woman_1774037769779.png" 
                    alt="Background" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
                <div className="relative z-10 flex items-center gap-8">
                   <div className="relative group/avatar">
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-3xl font-bold shadow-xl relative overflow-hidden">
                        {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="" /> : user.name?.[0] || user.email?.[0].toUpperCase()}
                      </div>
                      <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm hover:scale-105 transition-all text-black">
                        <Camera className="h-4 w-4" />
                      </button>
                   </div>
                   <div className="space-y-1">
                      <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white">{user.name || user.email?.split('@')[0]}</h1>
                      <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">SheDoo Member</p>
                   </div>
                </div>
             </section>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <ProfileCard title="Profile Details" icon={User} badge="Verified">
                 <div className="space-y-4">
                    <div className="space-y-1">
                       <p className="text-xs font-semibold text-black/40 uppercase tracking-widest">Email Address</p>
                       <p className="text-sm font-medium text-black">{user.email}</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-xs font-semibold text-black/40 uppercase tracking-widest">Phone Number</p>
                       <p className="text-sm font-medium text-black">+255749097220</p>
                    </div>
                    <div className="pt-4 border-t border-black/5">
                      <Button variant="outline" className="w-full h-10 rounded-xl border-black/10 font-semibold text-xs transition-all hover:bg-black hover:text-white">
                        <Edit2 className="h-3 w-3 mr-2" />
                        Edit Profile
                      </Button>
                    </div>
                 </div>
               </ProfileCard>

               <ProfileCard title="Shipping Address" icon={MapPin}>
                 <div className="space-y-4">
                    <div className="font-semibold text-black text-base leading-snug">
                       <p>Main Warehouse</p>
                       <p className="text-black/60 text-sm font-normal mt-1">Dar es Salaam, TZ</p>
                    </div>
                    <p className="text-xs font-semibold text-black/40 uppercase tracking-widest mt-2">Default Address</p>
                    <div className="pt-4 border-t border-black/5">
                      <Button variant="outline" className="w-full h-10 rounded-xl border-black/10 font-semibold text-xs transition-all hover:bg-black hover:text-white">
                        Manage Addresses
                      </Button>
                    </div>
                 </div>
               </ProfileCard>
             </div>

             <section className="bg-white rounded-3xl border border-black/5 p-8 shadow-sm space-y-8">
                <div className="flex items-center justify-between border-b border-black/5 pb-4">
                   <h2 className="text-sm font-semibold uppercase tracking-widest text-black/50">Recent Orders</h2>
                   <Link href="/orders" className="text-xs font-semibold text-black/40 hover:text-black flex items-center">
                      View All Orders <ChevronRight className="h-4 w-4 ml-1" />
                   </Link>
                </div>
                
                <div className="space-y-4">
                   <div className="p-6 rounded-2xl bg-black text-white relative overflow-hidden group/order flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm transition-all hover:bg-black/90">
                      <div className="space-y-2">
                         <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-white/10 rounded-md text-[10px] font-bold uppercase tracking-widest">Order #8A2F90</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-green-400 flex items-center gap-1.5">
                               <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                               Shipped
                            </span>
                         </div>
                         <h4 className="text-lg font-bold">Luxury Black Bag + 2 Items</h4>
                         <p className="text-white/60 text-xs font-medium mt-1">Total: $1,280.00</p>
                      </div>
                      <Link href="/order-tracking/8A2F90" className="w-full md:w-auto">
                        <Button className="w-full bg-white text-black hover:bg-gray-100 h-10 px-6 rounded-lg font-semibold text-xs shadow-sm">
                          Track Order
                        </Button>
                      </Link>
                   </div>
                </div>
             </section>
          </div>

          {/* Action Control Deck */}
          <div className="lg:col-span-4 space-y-8">
             <section className="bg-black text-white rounded-3xl p-8 shadow-sm space-y-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Sparkles className="h-32 w-32" />
                </div>
                <div className="relative z-10 space-y-6">
                   <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                     <Diamond className="h-6 w-6" />
                   </div>
                   <div>
                     <h3 className="text-2xl font-bold tracking-tight mb-2">SheDoo VIP</h3>
                     <p className="text-white/60 text-sm leading-relaxed font-medium">You are 2 orders away from 'VIP' status. Unlock worldwide dispatch priority and exclusive drops.</p>
                   </div>
                   <div className="space-y-3 pt-4 border-t border-white/10">
                      {[
                        { label: 'Currency', value: 'TZS' },
                        { label: 'Language', value: 'English' },
                        { label: 'Membership', value: 'Standard' },
                      ].map(item => (
                        <div key={item.label} className="flex justify-between items-center text-xs font-semibold uppercase tracking-widest">
                           <span className="text-white/40">{item.label}</span>
                           <span className="text-white">{item.value}</span>
                        </div>
                      ))}
                   </div>
                </div>
             </section>

             <section className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-black/50 px-4">Account Settings</h3>
                <div className="bg-white rounded-2xl border border-black/5 p-4 shadow-sm space-y-1">
                   {[
                     { label: 'Security Options', icon: Shield },
                     { label: 'Payment Methods', icon: CreditCard },
                     { label: 'Notifications', icon: Bell },
                     { label: 'Wishlist', icon: Heart, href: '/products' },
                   ].map((item) => (
                     <Button 
                      key={item.label} 
                      variant="ghost" 
                      className="w-full h-12 justify-between rounded-xl hover:bg-black/5 font-semibold text-xs transition-all px-4"
                      asChild={!!item.href}
                     >
                       {item.href ? (
                         <Link href={item.href}>
                           <span className="flex items-center text-black/70">
                            <item.icon className="h-4 w-4 mr-3 text-black/40" />
                            {item.label}
                           </span>
                           <ChevronRight className="h-4 w-4 text-black/20" />
                         </Link>
                       ) : (
                         <div className="cursor-pointer flex items-center justify-between w-full">
                           <span className="flex items-center text-black/70">
                            <item.icon className="h-4 w-4 mr-3 text-black/40" />
                            {item.label}
                           </span>
                           <ChevronRight className="h-4 w-4 text-black/20" />
                         </div>
                       )}
                     </Button>
                   ))}
                </div>
             </section>

             <Button 
              onClick={handleSignOut}
              variant="outline" 
              className="w-full h-12 rounded-xl border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 transition-all font-semibold text-xs"
             >
                <LogOut className="h-4 w-4 mr-3" />
                Sign Out
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
