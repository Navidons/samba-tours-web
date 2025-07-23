import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Booking Confirmation - Samba Tours & Travel",
  description: "Your booking has been confirmed! Thank you for choosing Samba Tours for your Uganda safari adventure.",
}

export default function BookingConfirmationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 
