
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BookingFormValues } from "@/schemas/bookingSchema";

// Define the booking status type explicitly
type BookingStatus = "pending" | "confirmed" | "completed" | "canceled";

export const useBookingSubmit = (
  user: any | null,
  stylistId: number | null,
  form: UseFormReturn<BookingFormValues>
) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: BookingFormValues) => {
    if (!user || !stylistId) {
      toast.error("Authentication or stylist selection error. Please try again.");
      return false;
    }

    setLoading(true);

    try {
      console.log("Submitting booking data:", data);
      console.log("Selected services:", data.services);
      
      // Get all selected service IDs and parse them as integers
      const serviceIds = data.services && data.services.length > 0 
        ? data.services.map(id => parseInt(id, 10))
        : [];
      
      console.log("Using service IDs:", serviceIds);

      if (serviceIds.length === 0) {
        toast.error("Please select at least one service");
        setLoading(false);
        return false;
      }

      // Define the booking status with the correct type
      const bookingStatus: BookingStatus = "pending";
      
      // Create separate bookings for each selected service
      for (const serviceId of serviceIds) {
        const bookingData = {
          client_id: user.id,
          client_name: data.name,
          client_email: data.email,
          client_phone: data.phone,
          stylist_id: stylistId,
          service_id: serviceId,
          date: data.date,
          time: data.time,
          status: bookingStatus,
          notes: data.notes || ""
        };

        console.log("Saving booking with data:", bookingData);

        const { data: result, error } = await supabase
          .from('bookings')
          .insert(bookingData)
          .select();

        if (error) {
          console.error("Booking error:", error);
          toast.error("Failed to book appointment. Please try again.");
          throw error;
        }

        console.log("Booking successful:", result);
        
        // Always create the stylist-service relationship if it doesn't exist yet
        const { data: existingRelation, error: checkError } = await supabase
          .from('stylist_services')
          .select('id')
          .eq('stylist_id', stylistId)
          .eq('service_id', serviceId)
          .maybeSingle();
          
        if (checkError) {
          console.error("Error checking stylist-service relationship:", checkError);
        }
        
        // If relationship doesn't exist, create it
        if (!existingRelation && !checkError) {
          console.log("Creating new stylist-service relationship:", { stylistId, serviceId });
          const { error: insertError } = await supabase
            .from('stylist_services')
            .insert({
              stylist_id: stylistId,
              service_id: serviceId
            });
            
          if (insertError) {
            console.error("Error creating stylist-service relationship:", insertError);
          } else {
            console.log("Successfully created stylist-service relationship");
          }
        }
      }
      
      // Show a success message with clear styling
      toast.success("Your appointment has been booked successfully!", {
        duration: 5000,
        position: "top-center",
        style: {
          backgroundColor: "#00593B",
          color: "white",
          fontWeight: "bold"
        }
      });
      
      // Reset the form
      form.reset();
      
      return true;
    } catch (error) {
      console.error("Error during booking submission:", error);
      toast.error("An unexpected error occurred. Please try again later.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { loading, handleSubmit };
};
