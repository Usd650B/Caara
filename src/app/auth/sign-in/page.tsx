"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Chrome, ArrowRight, CheckCircle, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signInWithGoogle } from "@/lib/customer-auth"

export default function SignInPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError("")
    setMessage("")
    
    try {
      const result = await signInWithGoogle()
      if (result.success) {
        setIsSuccess(true)
        setMessage("Successfully signed in! Redirecting...")
        setTimeout(() => {
          router.push('/orders')
        }, 2000)
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
          <h1 className="text-4xl font-black text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>CARA</h1>
          <p className="text-gray-300">Every Queen Wear CARA</p>
        </div>

        {/* Sign In Card */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">
              {isSuccess ? 'Welcome!' : 'Sign In'}
            </CardTitle>
            <p className="text-gray-300">
              {isSuccess ? 'You\'re all set!' : 'Sign in to your CARA account'}
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

            {!isSuccess && (
              <Button 
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full bg-white text-black hover:bg-gray-100"
              >
                <Chrome className="mr-2 h-4 w-4" />
                {isLoading ? 'Signing in...' : 'Continue with Google'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}

            {isSuccess && (
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
            {!isSuccess && (
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
          <div className="space-y-4 text-gray-300 text-sm">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Track your orders</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Save your favorites</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Faster checkout</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Exclusive offers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
