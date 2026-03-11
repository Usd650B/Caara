"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Phone, ArrowRight, CheckCircle, User, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { sendMagicLink, sendPhoneOTP, verifyPhoneOTP, convertGuestToProfile } from "@/lib/customer-auth"

export default function SignInPage() {
  const router = useRouter()
  const [method, setMethod] = useState<'email' | 'phone' | 'social'>('email')
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: input, 2: verification, 3: success
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleEmailSignIn = async () => {
    if (!email) return
    
    setIsLoading(true)
    setError("")
    
    try {
      const result = await sendMagicLink(email)
      if (result.success) {
        setStep(2)
        setMessage(`Magic link sent to ${email}! Check your email and click the link to sign in.`)
      } else {
        setError(result.error || "Failed to send magic link")
      }
    } catch (error) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhoneSignIn = async () => {
    if (!phone) return
    
    setIsLoading(true)
    setError("")
    
    try {
      const result = await sendPhoneOTP(phone)
      if (result.success) {
        setStep(2)
        setMessage(`OTP sent to ${phone}! Check your messages for the 6-digit code.`)
      } else {
        setError(result.error || "Failed to send OTP")
      }
    } catch (error) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPVerify = async () => {
    if (!otp || !phone) return
    
    setIsLoading(true)
    setError("")
    
    try {
      const result = await verifyPhoneOTP(phone, otp)
      if (result.success) {
        setStep(3)
        setMessage("Successfully signed in! Redirecting...")
        setTimeout(() => {
          router.push('/orders')
        }, 2000)
      } else {
        setError(result.error || "Invalid OTP")
      }
    } catch (error) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuestToProfile = async () => {
    if (!email) return
    
    setIsLoading(true)
    setError("")
    
    try {
      const result = await convertGuestToProfile(email, name)
      if (result.success) {
        setStep(3)
        setMessage("Profile created successfully! Your guest orders have been transferred.")
        setTimeout(() => {
          router.push('/orders')
        }, 2000)
      } else {
        setError(result.error || "Failed to create profile")
      }
    } catch (error) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>CARA</h1>
          <p className="text-gray-300">Every Queen Wear CARA</p>
        </div>

        {/* Sign In Card */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">
              {step === 3 ? 'Welcome!' : 'Sign In'}
            </CardTitle>
            <p className="text-gray-300">
              {step === 1 && 'Choose your preferred sign-in method'}
              {step === 2 && 'Complete your sign-in'}
              {step === 3 && 'You\'re all set!'}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <Alert className="bg-red-500/20 border-red-500/50 text-red-200">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {message && (
              <Alert className="bg-green-500/20 border-green-500/50 text-green-200">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {step === 1 && (
              <>
                {/* Method Selection */}
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    onClick={() => setMethod('email')}
                    variant={method === 'email' ? 'default' : 'outline'}
                    className="justify-start"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Email Magic Link
                  </Button>
                  
                  <Button
                    onClick={() => setMethod('phone')}
                    variant={method === 'phone' ? 'default' : 'outline'}
                    className="justify-start"
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Phone OTP
                  </Button>
                </div>

                {/* Email Input */}
                {method === 'email' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email" className="text-white">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                      />
                    </div>
                    
                    <Button 
                      onClick={handleEmailSignIn}
                      disabled={isLoading || !email}
                      className="w-full"
                    >
                      {isLoading ? 'Sending...' : 'Send Magic Link'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Phone Input */}
                {method === 'phone' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="phone" className="text-white">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                      />
                    </div>
                    
                    <Button 
                      onClick={handlePhoneSignIn}
                      disabled={isLoading || !phone}
                      className="w-full"
                    >
                      {isLoading ? 'Sending...' : 'Send OTP'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Guest to Profile */}
                <div className="border-t border-white/20 pt-4">
                  <p className="text-center text-gray-300 mb-4 text-sm">
                    Shopping as guest? Convert to a profile to save your orders:
                  </p>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="profile-email" className="text-white">Email Address</Label>
                      <Input
                        id="profile-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="profile-name" className="text-white">Name (Optional)</Label>
                      <Input
                        id="profile-name"
                        type="text"
                        placeholder="Your Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                      />
                    </div>
                    <Button 
                      onClick={handleGuestToProfile}
                      disabled={isLoading || !email}
                      variant="outline"
                      className="w-full"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Create Profile
                    </Button>
                  </div>
                </div>
              </>
            )}

            {step === 2 && method === 'phone' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="otp" className="text-white">Enter 6-Digit Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="bg-white/10 border-white/20 text-white placeholder-gray-400 text-center text-2xl tracking-widest"
                  />
                </div>
                
                <Button 
                  onClick={handleOTPVerify}
                  disabled={isLoading || otp.length !== 6}
                  className="w-full"
                >
                  {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                  <CheckCircle className="ml-2 h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  className="w-full"
                >
                  Back
                </Button>
              </div>
            )}

            {step === 2 && method === 'email' && (
              <div className="text-center space-y-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <Mail className="h-8 w-8 text-white mx-auto mb-2" />
                  <p className="text-white font-medium">Check your email</p>
                  <p className="text-gray-300 text-sm">We sent a magic link to {email}</p>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  className="w-full"
                >
                  Back
                </Button>
              </div>
            )}

            {step === 3 && (
              <div className="text-center space-y-4">
                <div className="bg-green-500/20 rounded-lg p-4">
                  <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <p className="text-white font-medium">Success!</p>
                  <p className="text-gray-300 text-sm">{message}</p>
                </div>
                
                <Link href="/orders">
                  <Button className="w-full">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    View My Orders
                  </Button>
                </Link>
              </div>
            )}

            {/* Skip for now */}
            {step === 1 && (
              <div className="text-center pt-4 border-t border-white/20">
                <Link href="/" className="text-gray-300 hover:text-white text-sm">
                  Continue as Guest
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm mb-4">Why create an account?</p>
          <div className="grid grid-cols-1 gap-2 text-sm text-gray-300">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Track all your orders in one place</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Faster checkout next time</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Download receipts anytime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
