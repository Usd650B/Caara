"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Mail, ShoppingBag, ArrowRight } from "lucide-react"
import Link from "next/link"
import { verifyMagicLink } from "@/lib/customer-auth"

function MagicLinkContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token || !email) {
      setError("Invalid magic link")
      setIsLoading(false)
      return
    }

    const verifyLink = async () => {
      try {
        const result = await verifyMagicLink(token, email)
        if (result.success && result.user) {
          setUser(result.user)
          setMessage("Successfully signed in! Welcome to CARA.")
          // Redirect to orders after 2 seconds
          setTimeout(() => {
            router.push('/orders')
          }, 2000)
        } else {
          setError(result.error || "Failed to verify magic link")
        }
      } catch (error) {
        setError("Something went wrong. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    verifyLink()
  }, [searchParams, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 flex items-center justify-center px-4">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Verifying your magic link...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>CARA</h1>
          <p className="text-gray-300">Every Queen Wear CARA</p>
        </div>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">
              {error ? 'Authentication Failed' : 'Welcome!'}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <Alert className="bg-red-500/20 border-red-500/50 text-red-200">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {message && (
              <>
                <Alert className="bg-green-500/20 border-green-500/50 text-green-200">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
                
                <div className="text-center space-y-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <Mail className="h-8 w-8 text-white mx-auto mb-2" />
                    <p className="text-white font-medium">You're signed in!</p>
                    <p className="text-gray-300 text-sm">Redirecting to your orders...</p>
                  </div>
                  
                  <Link href="/orders">
                    <Button className="w-full">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      View My Orders
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </>
            )}
            
            {error && (
              <div className="text-center space-y-4">
                <div className="bg-red-500/20 rounded-lg p-4">
                  <Mail className="h-8 w-8 text-red-400 mx-auto mb-2" />
                  <p className="text-white font-medium">Link Expired or Invalid</p>
                  <p className="text-gray-300 text-sm">Please request a new magic link</p>
                </div>
                
                <Link href="/auth/sign-in">
                  <Button variant="outline" className="w-full">
                    Try Again
                  </Button>
                </Link>
                
                <Link href="/">
                  <Button variant="ghost" className="w-full text-gray-300">
                    Continue as Guest
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function MagicLinkPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 flex items-center justify-center px-4">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Loading...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <MagicLinkContent />
    </Suspense>
  )
}
