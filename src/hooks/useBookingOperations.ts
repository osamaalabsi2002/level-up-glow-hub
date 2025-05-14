
import { useState } from "react";
import { Booking } from "@/types/dashboard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useBookingOperations = (initialBookings: Booking[]) => {
  const [localBookings, setLocalBookings] = useState<Booking[]>(initialBookings);
  const [isLoading, setIsLoading] = useState(false);
  
  // Function to handle booking deletion
  const handleDeleteBooking = async (id: number) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'canceled' })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setLocalBookings(localBookings.map(booking => 
        booking.id === id ? {...booking, status: "canceled" as const} : booking
      ));
      
      return true;
    } catch (error) {
      console.error("Error canceling booking:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle booking confirmation
  const handleConfirmBooking = async (id: number) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setLocalBookings(localBookings.map(booking => 
        booking.id === id ? {...booking, status: "confirmed" as const} : booking
      ));
      
      return true;
    } catch (error) {
      console.error("Error confirming booking:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    localBookings,
    setLocalBookings,
    isLoading,
    handleDeleteBooking,
    handleConfirmBooking
  };
};
