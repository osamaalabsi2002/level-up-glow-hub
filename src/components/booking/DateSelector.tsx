
import { useState } from "react";
import { format } from "date-fns";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { useDateAvailability } from "@/hooks/booking/useDateAvailability";
import BookingCalendar from "./BookingCalendar";

interface DateSelectorProps {
  form: UseFormReturn<any>;
  handleDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  stylistId?: number | null;
  disabled?: boolean;
}

const DateSelector = ({ form, handleDateChange, stylistId, disabled = false }: DateSelectorProps) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const { loading, isDateDisabled } = useDateAvailability(stylistId || null);
  
  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return;
    
    const formattedDate = format(date, "yyyy-MM-dd");
    
    // Create a synthetic event to pass to the handleDateChange function
    const syntheticEvent = {
      target: { value: formattedDate },
    } as React.ChangeEvent<HTMLInputElement>;
    
    handleDateChange(syntheticEvent);
    setIsCalendarOpen(false);
  };

  return (
    <FormField
      control={form.control}
      name="date"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Date</FormLabel>
          <FormControl>
            <BookingCalendar
              date={field.value ? new Date(field.value) : undefined}
              onSelect={handleSelectDate}
              isDisabled={isDateDisabled}
              loading={loading}
              disabled={disabled}
              calendarOpen={isCalendarOpen}
              setCalendarOpen={setIsCalendarOpen}
              placeholder={stylistId && !disabled ? "Select available date" : "Select stylist first"}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DateSelector;
