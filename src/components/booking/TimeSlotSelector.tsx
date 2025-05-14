
import { useEffect, useState } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";

interface TimeSlot {
  value: string;
  label: string;
  available: boolean;
}

interface TimeSlotSelectorProps {
  form: UseFormReturn<any>;
  selectedDate: string;
  stylistId: number | null;
}

const TimeSlotSelector = ({ form, selectedDate, stylistId }: TimeSlotSelectorProps) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  // Check available time slots when date changes
  useEffect(() => {
    if (selectedDate && stylistId) {
      checkAvailableTimeSlots(selectedDate, stylistId);
    } else {
      // If no date or stylist, all slots are available
      setTimeSlots(getDefaultTimeSlots());
    }
  }, [selectedDate, stylistId]);

  // Check available time slots
  const checkAvailableTimeSlots = async (date: string, stylistIdToCheck: number | null) => {
    if (!date || !stylistIdToCheck) {
      // If no date or stylist, all slots are available
      return setTimeSlots(getDefaultTimeSlots());
    }

    try {
      // Fetch bookings for this stylist on this date
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('time, status')
        .eq('stylist_id', stylistIdToCheck)
        .eq('date', date)
        .neq('status', 'canceled');
      
      if (error) throw error;

      // Default time slots (all available)
      const slots = getDefaultTimeSlots();
      
      // Mark booked slots as unavailable
      if (bookings && bookings.length > 0) {
        return setTimeSlots(slots.map(slot => {
          const isBooked = bookings.some(booking => booking.time === slot.value);
          return { ...slot, available: !isBooked };
        }));
      }

      return setTimeSlots(slots);
    } catch (error) {
      console.error('Error checking time slots:', error);
      // In case of error, return default slots
      return setTimeSlots(getDefaultTimeSlots());
    }
  };

  // Default time slots
  const getDefaultTimeSlots = (): TimeSlot[] => [
    { value: "09:00 AM", label: "09:00 AM", available: true },
    { value: "10:00 AM", label: "10:00 AM", available: true },
    { value: "11:00 AM", label: "11:00 AM", available: true },
    { value: "12:00 PM", label: "12:00 PM", available: true },
    { value: "01:00 PM", label: "01:00 PM", available: true },
    { value: "02:00 PM", label: "02:00 PM", available: true },
    { value: "03:00 PM", label: "03:00 PM", available: true },
    { value: "04:00 PM", label: "04:00 PM", available: true },
    { value: "05:00 PM", label: "05:00 PM", available: true }
  ];

  return (
    <FormField
      control={form.control}
      name="time"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Time</FormLabel>
          <Select 
            disabled={!selectedDate}
            onValueChange={field.onChange}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a time" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {timeSlots.map((slot) => (
                <SelectItem 
                  key={slot.value} 
                  value={slot.value}
                  disabled={!slot.available}
                  className={!slot.available ? "text-red-500" : ""}
                >
                  {slot.label} {!slot.available && "(Booked)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TimeSlotSelector;
