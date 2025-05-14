
import { useState } from "react";
import { Booking } from "@/types/dashboard";
import { toast } from "sonner";

export const useBookingOperations = (initialBookings: Booking[]) => {
  const [localBookings, setLocalBookings] = useState<Booking[]>(initialBookings);
  
  // Functions for CRUD operations
  const handleDeleteBooking = (id: number) => {
    toast.success(`Booking #${id} deleted successfully`);
    setLocalBookings(localBookings.filter(booking => booking.id !== id));
  };
  
  const handleConfirmBooking = (id: number) => {
    toast.success(`Booking #${id} confirmed successfully`);
    setLocalBookings(localBookings.map(booking => 
      booking.id === id ? {...booking, status: "confirmed" as const} : booking
    ));
  };

  return {
    localBookings,
    setLocalBookings,
    handleDeleteBooking,
    handleConfirmBooking
  };
};
