"use client"

import { useState, useEffect } from "react"
import { AuthModal } from "./auth-modal"

export function GlobalAuthModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [returnPath, setReturnPath] = useState<string | null>(null)

  useEffect(() => {
    const handleShowModal = (e: any) => {
      setIsOpen(true)
      if (e.detail?.returnPath) {
        setReturnPath(e.detail.returnPath)
      }
    }

    const handleCloseModal = () => {
      setIsOpen(false)
    }

    window.addEventListener('show-auth-modal', handleShowModal)
    window.addEventListener('close-auth-modal', handleCloseModal)

    return () => {
      window.removeEventListener('show-auth-modal', handleShowModal)
      window.removeEventListener('close-auth-modal', handleCloseModal)
    }
  }, [])

  const handleSuccess = () => {
    if (returnPath) {
      window.location.href = returnPath
    }
  }

  return (
    <AuthModal 
      isOpen={isOpen} 
      onClose={() => setIsOpen(false)} 
      onSuccess={handleSuccess}
    />
  )
}

export function openAuthModal(returnPath?: string) {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('show-auth-modal', { detail: { returnPath } });
    window.dispatchEvent(event);
  }
}
