"use client"

import { useState, useEffect } from "react"
import { X, Mail, Phone, ArrowRight, CheckCircle2, ShieldCheck, Zap, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signInWithGoogle, sendMagicLink, sendPhoneOTP, verifyPhoneOTP, verifyMagicLink } from "@/lib/customer-auth"
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
  title = "Unlock Luxury Access", 
  subtitle = "Sign up to explore our exclusive collection and enjoy premium benefits." 
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
        // For demo purposes, we usually just say "check email"
        // But the user wants it "easy", so maybe we'll just auto-login in this mock-like env if needed
        // For now, follow the existing lib logic
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-300 border border-white/50">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-20"
        >
          <X className="h-5 w-5 text-gray-400" />
        </button>

        <div className="flex flex-col md:flex-row h-full">
          {/* Left Side - Visual/Marketing (Hidden on mobile small) */}
          <div className="hidden md:flex w-2/5 relative flex-col justify-end p-8 overflow-hidden bg-[var(--brand-primary)]">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full -mr-20 -mt-20 blur-3xl opacity-50 bg-[var(--brand-accent)]" />
            
            <div className="relative z-10 space-y-4">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-xl flex items-center justify-center mb-4">
                <Star className="h-7 w-7 text-[var(--brand-accent)] fill-[var(--brand-accent)]" />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-[#FFFBEB]">VIP Access</p>
              <h3 className="text-3xl font-black leading-tight text-white">Join SheDoo<br/>Family</h3>
              <ul className="space-y-3 pt-4">
                {[
                  { icon: Zap, text: "Early access drops" },
                  { icon: ShieldCheck, text: "Lifetime warranty" },
                  { icon: CheckCircle2, text: "VIP support" }
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-white font-bold">
                    <item.icon className="h-5 w-5 text-[var(--brand-accent)]" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Side - Forms */}
          <div className="w-full md:w-3/5 p-8 sm:p-10 flex flex-col justify-center bg-white">
            {success ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-10">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-2 animate-bounce-slow">
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Welcome to SheDoo!</h3>
                <p className="text-sm text-gray-500">Your account has been created successfully.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h2>
                  <p className="text-sm text-gray-500 leading-relaxed">{subtitle}</p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium">
                    {error}
                  </div>
                )}

                {step === 'options' && (
                  <div className="space-y-3">
                    {/* Google Sign In */}
                    <Button 
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl shadow-sm transition-all flex items-center justify-center gap-3"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <span className="font-semibold text-sm">Continue with Google</span>
                    </Button>

                    <div className="relative py-4">
                      <div className="absolute inset-0 flex items-center text-gray-200">
                        <div className="w-full border-t border-gray-100"></div>
                      </div>
                      <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                        <span className="bg-white px-3 text-gray-400">or use your social</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        onClick={() => setStep('email')}
                        variant="ghost"
                        className="h-12 border border-gray-100 rounded-xl flex flex-col items-center justify-center gap-1 group hover:bg-gray-50"
                      >
                        <Mail className="h-4 w-4 text-gray-400 group-hover:text-black transition-colors" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-black">Email</span>
                      </Button>
                      <Button 
                        onClick={() => setStep('phone')}
                        variant="ghost"
                        className="h-12 border border-gray-100 rounded-xl flex flex-col items-center justify-center gap-1 group hover:bg-gray-50"
                      >
                        <Phone className="h-4 w-4 text-gray-400 group-hover:text-black transition-colors" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-black">Phone</span>
                      </Button>
                    </div>
                  </div>
                )}

                {step === 'email' && (
                  <form onSubmit={handleEmailSubmit} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-black focus:outline-none transition-colors text-sm"
                      />
                    </div>
                    <Button 
                      type="submit"
                      disabled={isLoading || !email}
                      className="w-full h-12 bg-black text-white hover:bg-gray-800 rounded-xl font-bold flex items-center justify-center gap-2 group"
                    >
                      {isLoading ? "Sending..." : "Send Magic Link"}
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <button 
                      type="button"
                      onClick={() => setStep('options')}
                      className="w-full text-center text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                    >
                      Back to options
                    </button>
                  </form>
                )}

                {step === 'phone' && (
                  <form onSubmit={handlePhoneSubmit} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Phone Number</label>
                      <input 
                        type="tel" 
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+255 --- --- ---"
                        className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-black focus:outline-none transition-colors text-sm"
                      />
                    </div>
                    <Button 
                      type="submit"
                      disabled={isLoading || !phone}
                      className="w-full h-12 bg-black text-white hover:bg-gray-800 rounded-xl font-bold flex items-center justify-center gap-2 group"
                    >
                      {isLoading ? "Sending..." : "Get Code"}
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <button 
                      type="button"
                      onClick={() => setStep('options')}
                      className="w-full text-center text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                    >
                      Back to options
                    </button>
                  </form>
                )}

                {step === 'verify' && (
                  <form onSubmit={handleOtpVerify} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-1.5 text-center">
                      <p className="text-xs text-gray-500 mb-4">We've sent a verification code to {phone || email}.</p>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Verification Code</label>
                      <input 
                        type="text" 
                        required
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="0 0 0 0 0 0"
                        className="w-full h-14 text-center text-2xl font-bold tracking-[0.5em] rounded-xl border border-gray-200 focus:border-black focus:outline-none transition-colors"
                      />
                    </div>
                    <Button 
                      type="submit"
                      disabled={isLoading || otp.length < 4}
                      className="w-full h-12 bg-black text-white hover:bg-gray-800 rounded-xl font-bold"
                    >
                      {isLoading ? "Verifying..." : "Verify & Sign In"}
                    </Button>
                    <button 
                      type="button"
                      onClick={() => setStep('options')}
                      className="w-full text-center text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                    >
                      Try another way
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
