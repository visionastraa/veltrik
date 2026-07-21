"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, handler: () => void) => void }
  }
}

interface RazorpayCheckoutProps {
  amount: number
  bookingId: string
  onSuccess: (payment: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) => void
  onFailure?: (error: string) => void
  disabled?: boolean
  buttonText?: string
}

export function RazorpayCheckout({
  amount,
  bookingId,
  onSuccess,
  onFailure,
  disabled = false,
  buttonText = "Pay Now",
}: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handlePayment = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, amount }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || "Failed to create order")

      const options = {
        key: data.key,
        amount: data.amount,
        currency: "INR",
        name: "Veltrik",
        description: "EV Purchase",
        order_id: data.orderId,
        handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          })
          const verifyData = await verifyRes.json()
          if (verifyData.success) {
            onSuccess({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })
            toast({ title: "Payment Successful", description: "Your booking is confirmed." })
          } else {
            throw new Error("Payment verification failed")
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
            onFailure?.("Payment cancelled by user")
          },
        },
        prefill: {
          contact: "",
          email: "",
        },
        theme: { color: "#7c3aed" },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.on("payment.failed", function () {
        toast({ title: "Payment Failed", description: "Please try again.", variant: "destructive" })
        setLoading(false)
      })
      razorpay.open()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Payment failed"
      toast({ title: "Error", description: message, variant: "destructive" })
      onFailure?.(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      className="bg-primary hover:bg-primary-dark text-white w-full"
      onClick={handlePayment}
      disabled={disabled || loading}
    >
      {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</> : buttonText}
    </Button>
  )
}
