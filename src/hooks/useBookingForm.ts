import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { BookingFormValues } from "@/schemas/bookingSchema";
import { useStylistData } from "./booking/useStylistData";
import { useServiceData } from "./booking/useServiceData";
import { useBookingSubmit } from "./booking/useBookingSubmit";
import { useDateTimeHandling } from "./booking/useDateTimeHandling";

export const useBookingForm = (
  form: UseFormReturn<any>,
  user: any | null,
  stylistName = "",
  selectedServiceId = ""
) => {
  const navigate = useNavigate();
  
  // Update form with stylist data when stylistName changes
  useEffect(() => {
    form.setValue("stylist", stylistName);
    
    if (selectedServiceId) {
      form.setValue("services", [selectedServiceId]);
    }
  }, [stylistName, selectedServiceId, form]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      console.log("User not authenticated, authentication will be required to complete booking");
    }
  }, [user, navigate]);
  
  // Get selected services from form
  const selectedServices = form.watch("services") || [];

  // Use our custom hooks
  const { services } = useServiceData(selectedServiceId);
  const { stylistId, eligibleStylists, handleStylistSelect } = useStylistData(stylistName, selectedServices);
  const { selectedDate, handleDateChange } = useDateTimeHandling(form);
  const { loading, handleSubmit } = useBookingSubmit(user, stylistId, form);

  // Connect stylist selection to form reset
  const handleStylistSelection = (id: number | null) => {
    const newStylistId = handleStylistSelect(id);
    
    // Reset date and time when stylist changes
    form.setValue("date", "");
    form.setValue("time", "");
    setSelectedDate("");
    
    return newStylistId;
  };

  // Set internal date state when handleDateChange is called
  const setSelectedDate = (date: string) => {
    selectedDate; // Reference to avoid TypeScript unused variable warning
    // This function exists to keep the API compatible with the original hook
  };

  return {
    loading,
    services,
    stylistId,
    selectedDate,
    eligibleStylists,
    handleDateChange,
    handleStylistSelect: handleStylistSelection,
    handleSubmit
  };
};
