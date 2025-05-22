
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { BookingFormValues } from "@/schemas/bookingSchema";

export const useDateTimeHandling = (form: UseFormReturn<BookingFormValues>) => {
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Handle date change
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;
    console.log("Date changed to:", newDate);
    form.setValue("date", newDate);
    setSelectedDate(newDate);
    
    // Reset time when date changes
    form.setValue("time", "");
  };

  return {
    selectedDate,
    handleDateChange
  };
};
