"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Chrome, ArrowRight, CheckCircle, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signInWithGoogle, User } from "@/lib/customer-auth"

export default function SignInPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [userData, setUserData] = useState<User | null>(null)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError("")
    setMessage("")
    
    try {
      const result = await signInWithGoogle()
      if (result.success && result.user) {
        setUserData(result.user)
        setIsSuccess(true)
        // Wait gracefully while the 'proceeding as' animation plays
        setTimeout(() => {
          router.push('/orders')
        }, 2500)
      } else {
        setError(result.error || "Failed to sign in with Google")
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
          <h1 className="text-4xl font-black text-white mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>CARA</h1>
          <p className="text-gray-300">Every Queen Wears CARA</p>
        </div>

        {/* Sign In Card */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">
              {isSuccess ? 'Welcome Back!' : 'Sign In'}
            </CardTitle>
            <p className="text-gray-300">
              {isSuccess ? 'You\'re securely authenticated.' : 'Sign in to your CARA account'}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <Alert className="bg-red-500/20 border-red-500/50 text-red-200">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {message && !isSuccess && (
              <Alert className="bg-green-500/20 border-green-500/50 text-green-200">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {!isSuccess && (
              <Button 
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full bg-white text-black hover:bg-gray-100 h-12 rounded-xl text-base shadow-xl"
              >
                <Chrome className="mr-3 h-5 w-5" />
                {isLoading ? 'Connecting to Google...' : 'Continue with Google'}
                {!isLoading && <ArrowRight className="ml-auto h-5 w-5" />}
              </Button>
            )}

            {isSuccess && userData && (
              <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-md">
                  <div className="relative inline-block mb-4">
                    {userData.avatar ? (
                      <img src={userData.avatar} alt={userData.name} className="w-20 h-20 rounded-full border-4 border-white/20 shadow-2xl mx-auto object-cover" />
                    ) : (
                      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/10 mx-auto shadow-2xl">
                        <span className="text-3xl text-white font-bold">{userData.name?.charAt(0) || userData.email?.charAt(0)}</span>
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-4 border-gray-900 shadow-xl">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    Proceeding as <span className="text-primary">{userData.name?.split(' ')[0] || "User"}</span>
                  </h3>
                  <p className="text-gray-400 text-sm overflow-hidden text-ellipsis">{userData.email}</p>
                </div>
                
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span className="text-xs text-gray-400 tracking-widest uppercase">Securing your session</span>
                </div>
              </div>
            )}

            {/* Skip for now */}
            {!isSuccess && (
              <div className="text-center pt-4 border-t border-white/20">
                <Link href="/" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Continue as Guest
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="mt-8 text-center">
          <div className="flex flex-wrap items-center justify-center gap-4 text-gray-400 text-xs tracking-wider uppercase">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-3 w-3 text-white/50" />
              <span>Track Orders</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-3 w-3 text-white/50" />
              <span>Save Favorites</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-3 w-3 text-white/50" />
              <span>Exclusive Offers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
