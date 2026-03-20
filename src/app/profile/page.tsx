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
    <div className="bg-white rounded-[2.5rem] border border-black/5 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
        <Icon className="h-24 w-24" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30">{title}</h3>
           {badge && <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[9px] font-black uppercase tracking-widest">{badge}</span>}
        </div>
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 md:py-24">
        {/* Navigation */}
        <div className="mb-12">
           <Link href="/" className="group inline-flex items-center text-[10px] font-black uppercase tracking-widest text-black/30 hover:text-black transition-colors">
             <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
             Return to Gallery
           </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Identity Node */}
          <div className="lg:col-span-8 space-y-12">
             <section className="relative h-80 rounded-[3rem] overflow-hidden bg-black flex items-center p-12 group">
                <div className="absolute inset-0 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100">
                  <img 
                    src="/hero_fashion_woman_1774037769779.png" 
                    alt="Background" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
                <div className="relative z-10 flex items-center gap-10">
                   <div className="relative group/avatar">
                      <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-4xl font-black shadow-2xl relative overflow-hidden">
                        {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="" /> : user.name?.[0] || user.email?.[0].toUpperCase()}
                      </div>
                      <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-xl hover:scale-110 transition-all text-black">
                        <Camera className="h-4 w-4" />
                      </button>
                   </div>
                   <div className="space-y-2">
                      <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase">{user.name || user.email?.split('@')[0]}</h1>
                      <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Authorized Client • Level 01</p>
                   </div>
                </div>
             </section>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <ProfileCard title="Identity Matrix" icon={User} badge="Verified">
                 <div className="space-y-6">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-black/20 uppercase tracking-widest">Digital Identifier</p>
                       <p className="text-sm font-bold text-black">{user.email}</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-black/20 uppercase tracking-widest">Communications Node</p>
                       <p className="text-sm font-bold text-black">+255749097220</p>
                    </div>
                    <div className="pt-6 border-t border-black/5">
                      <Button variant="outline" className="w-full h-12 rounded-xl border-black/5 font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                        <Edit2 className="h-3 w-3 mr-2" />
                        Modify Matrix
                      </Button>
                    </div>
                 </div>
               </ProfileCard>

               <ProfileCard title="Logistics Node" icon={MapPin}>
                 <div className="space-y-6">
                    <div className="space-y-2 font-black text-black uppercase tracking-tight text-lg leading-tight">
                       <p>Main Warehouse</p>
                       <p>Dar es Salaam, TZ</p>
                    </div>
                    <p className="text-[10px] font-black text-black/20 uppercase tracking-widest">Active Address</p>
                    <div className="pt-6 border-t border-black/5">
                      <Button variant="outline" className="w-full h-12 rounded-xl border-black/5 font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                        Manage Destinations
                      </Button>
                    </div>
                 </div>
               </ProfileCard>
             </div>

             <section className="bg-white rounded-[3rem] border border-black/5 p-12 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-10">
                <div className="flex items-center justify-between">
                   <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30">Acquisition History</h2>
                   <Link href="/orders" className="text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-black">
                      View Entire Manifest <ChevronRight className="h-3 w-3 inline ml-1" />
                   </Link>
                </div>
                
                <div className="space-y-6">
                   <div className="p-8 rounded-[2rem] bg-black text-white relative overflow-hidden group/order cursor-pointer shadow-xl shadow-black/10 transition-all hover:scale-[1.01]">
                      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover/order:scale-110 transition-transform">
                        <Package className="h-20 w-20" />
                      </div>
                      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-4">
                           <div className="flex items-center gap-3">
                              <span className="px-3 py-1 bg-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest">Manifest #8A2F90</span>
                              <span className="text-[9px] font-black uppercase tracking-widest text-green-400 flex items-center gap-1.5">
                                 <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                 Live Dispatch
                              </span>
                           </div>
                           <h4 className="text-2xl font-black uppercase tracking-tight">Luxury Silk Silhouette + 2 Assets</h4>
                           <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Allocated Total: $1,280.00</p>
                        </div>
                        <Button className="bg-white text-black hover:bg-white/90 h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">
                          Track Manifest
                        </Button>
                      </div>
                   </div>
                </div>
             </section>
          </div>

          {/* Action Control Deck */}
          <div className="lg:col-span-4 space-y-12">
             <section className="bg-black text-white rounded-[3rem] p-10 shadow-2xl shadow-black/20 space-y-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-[0.05] group-hover:scale-110 transition-transform duration-1000">
                  <Sparkles className="h-40 w-40" />
                </div>
                <div className="relative z-10 space-y-8">
                   <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                     <Diamond className="h-8 w-8" />
                   </div>
                   <div>
                     <h3 className="text-3xl font-black tracking-tighter leading-none mb-4">Elite <br/> Privilege</h3>
                     <p className="text-white/40 text-sm leading-relaxed font-medium">System nodes indicate you are 2 manifests away from 'Ambassador' status. Unlock worldwide dispatch priority.</p>
                   </div>
                   <div className="space-y-4 pt-4 border-t border-white/10">
                      {[
                        { label: 'Primary Currency', value: 'TZS Node' },
                        { label: 'Interface Node', value: 'ENG Protocol' },
                        { label: 'Access Level', value: 'Client Elite' },
                      ].map(item => (
                        <div key={item.label} className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                           <span className="text-white/30">{item.label}</span>
                           <span className="text-white">{item.value}</span>
                        </div>
                      ))}
                   </div>
                   <Button className="w-full h-14 bg-white text-black hover:bg-white/90 font-black text-[10px] uppercase tracking-widest rounded-2xl">
                      Access Vault Settings
                   </Button>
                </div>
             </section>

             <section className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 px-6">System Protocol</h3>
                <div className="bg-white rounded-[2.5rem] border border-black/5 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-2">
                   {[
                     { label: 'Security Architecture', icon: Shield },
                     { label: 'Payment Methods', icon: CreditCard },
                     { label: 'Communication Hub', icon: Bell },
                     { label: 'Wishlist Repository', icon: Heart, href: '/products' },
                   ].map((item) => (
                     <Button 
                      key={item.label} 
                      variant="ghost" 
                      className="w-full h-14 justify-between rounded-2xl hover:bg-black/[0.02] font-black text-[10px] uppercase tracking-widest px-6"
                      asChild={!!item.href}
                     >
                       {item.href ? (
                         <Link href={item.href}>
                           <span className="flex items-center">
                            <item.icon className="h-4 w-4 mr-4 text-black/20" />
                            {item.label}
                           </span>
                           <ChevronRight className="h-4 w-4 text-black/10" />
                         </Link>
                       ) : (
                         <>
                           <span className="flex items-center">
                            <item.icon className="h-4 w-4 mr-4 text-black/20" />
                            {item.label}
                           </span>
                           <ChevronRight className="h-4 w-4 text-black/10" />
                         </>
                       )}
                     </Button>
                   ))}
                </div>
             </section>

             <Button 
              onClick={handleSignOut}
              variant="outline" 
              className="w-full h-16 rounded-[2rem] border-red-50 text-red-500 hover:bg-red-50 hover:text-red-600 transition-all font-black text-[10px] uppercase tracking-widest"
             >
                <LogOut className="h-4 w-4 mr-4" />
                Terminate System Access
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
