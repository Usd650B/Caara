"use client"

import { useState, useEffect } from "react"
import { X, Mail, Phone, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signInWithGoogle, sendMagicLink, sendPhoneOTP, verifyPhoneOTP } from "@/lib/customer-auth"
import { useSettings } from "@/lib/settings"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  title?: string
  subtitle?: string
}

export function AuthModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  title = "Welcome back", 
  subtitle = "Sign in to your account to enjoy premium benefits and exclusive access." 
}: AuthModalProps) {
  const { t } = useSettings()
  const [step, setStep] = useState<'options' | 'email' | 'phone' | 'verify'>('options')
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('options')
        setEmail("")
        setPhone("")
        setOtp("")
        setError("")
        setSuccess(false)
      }, 300)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError("")
    try {
      const result = await signInWithGoogle()
      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          onSuccess?.()
          onClose()
        }, 1500)
      } else {
        setError(result.error || "Failed to sign in")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setIsLoading(true)
    setError("")
    try {
      const result = await sendMagicLink(email)
      if (result.success) {
        setStep('verify')
      } else {
        setError(result.error || "Failed to send link")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone) return
    setIsLoading(true)
    setError("")
    try {
      const result = await sendPhoneOTP(phone)
      if (result.success) {
        setStep('verify')
      } else {
        setError(result.error || "Failed to send OTP")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp) return
    setIsLoading(true)
    setError("")
    try {
      const result = await verifyPhoneOTP(phone, otp)
      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          onSuccess?.()
          onClose()
        }, 1500)
      } else {
        setError(result.error || "Invalid verification code")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-4xl bg-white rounded-[40px] overflow-hidden shadow-2xl animate-scale-in flex flex-col md:flex-row min-h-[600px]">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-2 hover:bg-zinc-50 rounded-full transition-all z-20 text-zinc-300 hover:text-black"
        >
          <X size={20} />
        </button>

        {/* Left Side — Branding */}
        <div className="hidden md:flex w-[40%] bg-zinc-50 flex-col justify-between p-12 relative overflow-hidden border-r border-zinc-100">
           <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/20 rounded-full blur-3xl -mr-32 -mt-32" />
           
           <div className="relative z-10">
              <span className="text-xl font-bold tracking-tighter uppercase italic mb-16 block">SheDoo</span>
              <div className="flex flex-col gap-6">
                 <h2 className="text-4xl font-bold leading-tight">The <span className="luxury-italic">Collective</span></h2>
                 <p className="text-zinc-500 text-sm leading-relaxed">Join a community of modern women who value timeless style and effortless elegance.</p>
              </div>
           </div>

           <div className="relative z-10 flex flex-col gap-4">
              {[
                { icon: Sparkles, text: "Early access to drops" },
                { icon: ShieldCheck, text: "Concierge order support" },
                { icon: Star, text: "Member-only perks" }
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-zinc-400">
                   <benefit.icon size={16} className="text-zinc-300" />
                   <span>{benefit.text}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Right Side — Forms */}
        <div className="flex-1 p-12 md:p-16 flex flex-col justify-center">
            {success ? (
              <div className="flex flex-col items-center text-center animate-fade-up">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-8">
                  <CheckCircle2 size={40} className="text-emerald-500" />
                </div>
                <h3 className="text-3xl font-bold italic mb-3">Welcome home</h3>
                <p className="text-zinc-500 text-sm">Your journey with the collective has begun.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-10">
                 <div className="flex flex-col gap-3">
                    <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
                    <p className="text-zinc-500 text-sm leading-relaxed">{subtitle}</p>
                 </div>

                 {error && (
                   <div className="p-4 bg-red-50 rounded-2xl text-red-500 text-[10px] font-bold uppercase tracking-widest border border-red-100">
                     {error}
                   </div>
                 )}

                 {step === 'options' && (
                    <div className="flex flex-col gap-4">
                       <button 
                         onClick={handleGoogleSignIn}
                         disabled={isLoading}
                         className="h-14 w-full bg-white border border-zinc-200 rounded-full flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-50 transition-all shadow-sm"
                       >
                         <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                           <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                           <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                           <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                           <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                         </svg>
                         Continue with Google
                       </button>

                       <div className="relative py-4">
                         <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-zinc-100" />
                         </div>
                         <div className="relative flex justify-center">
                            <span className="bg-white px-4 text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-300">or use your private credentials</span>
                         </div>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                          <button 
                             onClick={() => setStep('email')}
                             className="flex flex-col items-center justify-center gap-3 p-4 bg-zinc-50 rounded-3xl hover:bg-zinc-100 transition-all border border-transparent hover:border-zinc-200 group"
                          >
                             <Mail size={20} className="text-zinc-300 group-hover:text-black transition-colors" />
                             <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-black">Email</span>
                          </button>
                          <button 
                             onClick={() => setStep('phone')}
                             className="flex flex-col items-center justify-center gap-3 p-4 bg-zinc-50 rounded-3xl hover:bg-zinc-100 transition-all border border-transparent hover:border-zinc-200 group"
                          >
                             <Phone size={20} className="text-zinc-300 group-hover:text-black transition-colors" />
                             <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-black">Phone</span>
                          </button>
                       </div>
                    </div>
                 )}

                 {step === 'email' && (
                    <form onSubmit={handleEmailSubmit} className="flex flex-col gap-6 animate-fade-up">
                       <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Email Address</label>
                          <input 
                             type="email" 
                             required
                             value={email}
                             onChange={(e) => setEmail(e.target.value)}
                             placeholder="your@email.com"
                             className="h-14 bg-zinc-50 border-none rounded-2xl px-6 text-sm focus:ring-1 focus:ring-black outline-none"
                          />
                       </div>
                       <button 
                          type="submit"
                          disabled={isLoading || !email}
                          className="btn btn-primary h-14 rounded-full flex items-center justify-center gap-2 group"
                       >
                          {isLoading ? "Envoiyng..." : "Send Magic Link"}
                          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                       </button>
                       <button onClick={() => setStep('options')} className="text-[9px] font-bold uppercase tracking-widest text-zinc-300 hover:text-black transition-colors">Go Back</button>
                    </form>
                 )}

                 {step === 'phone' && (
                    <form onSubmit={handlePhoneSubmit} className="flex flex-col gap-6 animate-fade-up">
                       <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Phone Number</label>
                          <input 
                             type="tel" 
                             required
                             value={phone}
                             onChange={(e) => setPhone(e.target.value)}
                             placeholder="+255 --- --- ---"
                             className="h-14 bg-zinc-50 border-none rounded-2xl px-6 text-sm focus:ring-1 focus:ring-black outline-none"
                          />
                       </div>
                       <button 
                          type="submit"
                          disabled={isLoading || !phone}
                          className="btn btn-primary h-14 rounded-full flex items-center justify-center gap-2 group"
                       >
                          {isLoading ? "Sending..." : "Get Verification Code"}
                          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                       </button>
                       <button onClick={() => setStep('options')} className="text-[9px] font-bold uppercase tracking-widest text-zinc-300 hover:text-black transition-colors">Go Back</button>
                    </form>
                 )}

                 {step === 'verify' && (
                    <form onSubmit={handleOtpVerify} className="flex flex-col gap-8 animate-fade-up text-center">
                       <div className="flex flex-col gap-4">
                          <p className="text-zinc-500 text-sm">We've sent a code to your device.</p>
                          <input 
                             type="text" 
                             required
                             maxLength={6}
                             value={otp}
                             onChange={(e) => setOtp(e.target.value)}
                             placeholder="● ● ● ● ● ●"
                             className="h-20 text-center text-4xl font-bold tracking-widest rounded-3xl bg-zinc-50 border-none focus:ring-1 focus:ring-black outline-none"
                          />
                       </div>
                       <button 
                          type="submit"
                          disabled={isLoading || otp.length < 4}
                          className="btn btn-primary h-14 rounded-full"
                       >
                          {isLoading ? "Verifying..." : "Access the Collective"}
                       </button>
                       <button onClick={() => setStep('options')} className="text-[9px] font-bold uppercase tracking-widest text-zinc-300 hover:text-black transition-colors">Try another way</button>
                    </form>
                 )}
              </div>
            )}
        </div>
      </div>
    </div>
  )
}
