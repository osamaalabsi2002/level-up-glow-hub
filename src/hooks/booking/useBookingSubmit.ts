
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { BookingFormValues } from "@/schemas/bookingSchema";

export const useBookingSubmit = (
  user: any | null, 
  stylistId: number | null,
  form: UseFormReturn<BookingFormValues>
) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (data: BookingFormValues) => {
    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to log in to book an appointment",
        variant: "destructive"
      });
      navigate('/login');
      return false;
    }
    
    try {
      setLoading(true);
      console.log("Submitting booking form with data:", data);
      
      // Get service ID based on selected services
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('id, name, duration')
        .in('name', data.services);
      
      if (serviceError && serviceError.code !== 'PGRST116') {
        console.error("Error fetching service data:", serviceError);
        throw serviceError;
      }
      
      if (!serviceData || serviceData.length === 0) {
        throw new Error("Selected services not found");
      }
      
      // Calculate total duration
      const totalDuration = serviceData.reduce((sum, service) => sum + service.duration, 0);
      
      // If stylistName not provided, try to find stylist by the entered name
      let finalStylistId = stylistId;
      if (!finalStylistId && data.stylist) {
        console.log("Looking up stylist by name:", data.stylist);
        const { data: stylistData } = await supabase
          .from('stylists')
          .select('id')
          .eq('name', data.stylist)
          .maybeSingle();
        
        if (stylistData) {
          console.log("Found stylist ID:", stylistData.id);
          finalStylistId = stylistData.id;
        } else {
          console.log("No stylist found with name:", data.stylist);
        }
      }

      // Store client info in the booking
      const bookingData = {
        client_id: user.id,
        stylist_id: finalStylistId,
        service_id: serviceData[0]?.id || null, // Primary service
        date: data.date,
        time: data.time,
        duration: totalDuration,
        status: 'pending' as 'pending' | 'confirmed' | 'completed' | 'canceled',
        client_name: data.name,
        client_email: data.email,
        client_phone: data.phone,
        notes: `Additional services: ${data.services.slice(1).join(', ')}`, // Store additional services in notes
      };
      
      console.log("Booking data to insert:", bookingData);
      
      const { error } = await supabase
        .from('bookings')
        .insert(bookingData);
      
      if (error) {
        console.error("Error inserting booking:", error);
        toast({
          title: "Booking failed",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
      
      console.log("Booking successful!");
      toast({
        title: "Booking successful!",
        description: "We'll contact you shortly to confirm your appointment.",
      });
      
      return true;
    } catch (error: any) {
      console.error("Booking error:", error);
      toast({
        title: "Booking failed",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleSubmit
  };
};
