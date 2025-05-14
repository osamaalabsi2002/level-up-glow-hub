
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
import { toast } from "@/components/ui/use-toast";
import { format, parse } from "date-fns";
import { Loader2 } from "lucide-react";

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
  const [loading, setLoading] = useState(false);

  // Check available time slots when date changes
  useEffect(() => {
    if (selectedDate && stylistId) {
      checkAvailableTimeSlots(selectedDate, stylistId);
    } else {
      // Reset time slots if no date or stylist selected
      setTimeSlots([]);
      form.setValue("time", "");
    }
  }, [selectedDate, stylistId, form]);

  // Check available time slots using our database function
  const checkAvailableTimeSlots = async (date: string, stylistIdToCheck: number | null) => {
    if (!date || !stylistIdToCheck) {
      return setTimeSlots([]);
    }

    try {
      setLoading(true);
      console.log("Checking availability for date:", date, "and stylist:", stylistIdToCheck);
      
      // Get default time slots (all time slots)
      const allTimeSlots = getDefaultTimeSlots();
      
      // For each time slot, check if it's available using our PostgreSQL function
      const availabilityChecks = await Promise.all(
        allTimeSlots.map(async (slot) => {
          // Format the time for the database query (convert from "09:00 AM" to "09:00:00")
          const timeValue = format(
            parse(slot.value, 'hh:mm a', new Date()),
            'HH:mm:ss'
          );
          
          const { data, error } = await supabase.rpc(
            'check_stylist_availability',
            {
              p_stylist_id: stylistIdToCheck,
              p_date: date,
              p_time: timeValue
            }
          );
          
          if (error) {
            console.error("Error checking time slot availability:", error);
            return { ...slot, available: false };
          }
          
          return { ...slot, available: data };
        })
      );
      
      console.log("Available time slots:", availabilityChecks);
      setTimeSlots(availabilityChecks);
    } catch (error) {
      console.error('Error checking time slots:', error);
      toast({
        title: "Error",
        description: "Failed to check available time slots",
        variant: "destructive"
      });
      setTimeSlots(getDefaultTimeSlots().map(slot => ({ ...slot, available: false })));
    } finally {
      setLoading(false);
    }
  };

  // Default time slots (business hours)
  const getDefaultTimeSlots = (): TimeSlot[] => [
    { value: "09:00 AM", label: "09:00 AM", available: true },
    { value: "10:00 AM", label: "10:00 AM", available: true },
    { value: "11:00 AM", label: "11:00 AM", available: true },
    { value: "12:00 PM", label: "12:00 PM", available: true },
    { value: "01:00 PM", label: "01:00 PM", available: true },
    { value: "02:00 PM", label: "02:00 PM", available: true },
    { value: "03:00 PM", label: "03:00 PM", available: true },
    { value: "04:00 PM", label: "04:00 PM", available: true },
    { value: "05:00 PM", label: "05:00 PM", available: true },
    { value: "06:00 PM", label: "06:00 PM", available: true },
    { value: "07:00 PM", label: "07:00 PM", available: true },
    { value: "08:00 PM", label: "08:00 PM", available: true },
    { value: "09:00 PM", label: "09:00 PM", available: true }
  ];

  return (
    <FormField
      control={form.control}
      name="time"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Time</FormLabel>
          <Select 
            disabled={!selectedDate || !stylistId || loading}
            onValueChange={field.onChange}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={loading ? "Checking availability..." : "Select a time"} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {loading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
              
              {!loading && timeSlots.length > 0 ? (
                timeSlots.map((slot) => (
                  <SelectItem 
                    key={slot.value} 
                    value={slot.value}
                    disabled={!slot.available}
                    className={!slot.available ? "text-red-500 opacity-50" : ""}
                  >
                    {slot.label} {!slot.available && "(Unavailable)"}
                  </SelectItem>
                ))
              ) : !loading && (
                <div className="py-2 px-2 text-center text-sm text-muted-foreground">
                  {!selectedDate ? "Select a date first" : !stylistId ? "Select a stylist first" : "No time slots available"}
                </div>
              )}
            </SelectContent>
          </Select>
          
          {!selectedDate && <p className="text-xs text-muted-foreground mt-1">Select a date first</p>}
          {selectedDate && !stylistId && <p className="text-xs text-muted-foreground mt-1">Select a stylist first</p>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TimeSlotSelector;
