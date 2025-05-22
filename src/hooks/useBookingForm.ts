
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { BookingFormValues } from "@/schemas/bookingSchema";
import { useStylistData } from "./booking/useStylistData";
import { useServiceData } from "./booking/useServiceData";
import { useBookingSubmit } from "./booking/useBookingSubmit";
import { useDateTimeHandling } from "./booking/useDateTimeHandling";
import { toast } from "sonner";

export const useBookingForm = (
  form: UseFormReturn<BookingFormValues>,
  user: any | null,
  stylistName = "",
  selectedServiceId = "",
  initialStylistId?: number
) => {
  const navigate = useNavigate();
  const [formStylistId, setFormStylistId] = useState<number | null>(initialStylistId || null);
  
  // Get selected services from form
  const selectedServices = form.watch("services") || [];
  
  // Initial setup effect
  useEffect(() => {
    console.log("Setting up booking form with:", { 
      stylistName, 
      selectedServiceId, 
      initialStylistId 
    });
    
    // Handle service selection first
    if (selectedServiceId) {
      console.log("Setting service:", selectedServiceId);
      form.setValue("services", [selectedServiceId], { shouldValidate: true });
    }
    
    // Handle stylist name or ID if provided
    if (stylistName) {
      console.log("Setting stylist name:", stylistName);
      form.setValue("stylist", stylistName, { shouldValidate: true });
    }

    if (initialStylistId) {
      console.log("Setting stylist ID:", initialStylistId);
      setFormStylistId(initialStylistId);
      form.setValue("stylistId", initialStylistId, { shouldValidate: true });
    }
  }, [stylistName, selectedServiceId, initialStylistId, form]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      console.log("User not authenticated, authentication will be required to complete booking");
    }
  }, [user, navigate]);
  
  console.log("Fetching stylists...");
  // Use our custom hooks
  const { stylistId, eligibleStylists, loading: stylistsLoading, handleStylistSelect } = useStylistData(stylistName, selectedServices);
  const { services, loading: servicesLoading } = useServiceData(selectedServiceId, formStylistId);
  const { selectedDate, handleDateChange } = useDateTimeHandling(form);
  const { loading: submitLoading, handleSubmit } = useBookingSubmit(user, stylistId || formStylistId, form);

  // If we have a stylist from the hook, update the form stylist ID
  useEffect(() => {
    if (stylistId && stylistId !== formStylistId) {
      console.log("Stylist ID updated from hook:", stylistId);
      setFormStylistId(stylistId);
      form.setValue("stylistId", stylistId, { shouldValidate: true });
    }
  }, [stylistId, form, formStylistId]);

  // Connect stylist selection to form
  const handleStylistSelection = (id: number | null) => {
    console.log("Selecting stylist:", id);
    setFormStylistId(id);
    
    // Reset date and time when stylist changes
    form.setValue("date", "");
    form.setValue("time", "");
    form.setValue("stylistId", id || undefined, { shouldValidate: true });
    
    return handleStylistSelect(id);
  };

  // Handle service selection
  const handleServiceSelection = (services: string[]) => {
    console.log("Selected services:", services);
    form.setValue("services", services, { shouldValidate: true });
  };

  return {
    loading: submitLoading || stylistsLoading || servicesLoading,
    stylistsLoading,
    servicesLoading,
    services,
    stylistId: stylistId || formStylistId,
    selectedDate,
    eligibleStylists,
    handleDateChange,
    handleStylistSelect: handleStylistSelection,
    handleServiceSelection,
    handleSubmit
  };
};
