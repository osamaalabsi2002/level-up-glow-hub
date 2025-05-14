
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
import { Loader2, Clock, Calendar, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [noAvailableTimes, setNoAvailableTimes] = useState(false);

  // Check available time slots when date changes
  useEffect(() => {
    if (selectedDate && stylistId) {
      checkAvailableTimeSlots(selectedDate, stylistId);
    } else {
      // Reset time slots if no date or stylist selected
      setTimeSlots([]);
      form.setValue("time", "");
      setNoAvailableTimes(false);
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
      
      // Filter to only available time slots
      const availableTimeSlots = availabilityChecks.filter(slot => slot.available);
      console.log("Available time slots:", availableTimeSlots);
      
      setTimeSlots(availableTimeSlots);
      setNoAvailableTimes(availableTimeSlots.length === 0);
      
      // If there are available slots but the currently selected time is not available, reset it
      if (availableTimeSlots.length > 0 && form.getValues("time")) {
        const currentTime = form.getValues("time");
        const isCurrentTimeAvailable = availableTimeSlots.some(slot => slot.value === currentTime);
        
        if (!isCurrentTimeAvailable) {
          form.setValue("time", "");
        }
      }
    } catch (error) {
      console.error('Error checking time slots:', error);
      toast({
        title: "Error",
        description: "Failed to check available time slots",
        variant: "destructive"
      });
      setTimeSlots([]);
      setNoAvailableTimes(true);
    } finally {
      setLoading(false);
    }
  };

  // Default time slots (business hours)
  const getDefaultTimeSlots = (): TimeSlot[] => [
    { value: "09:00 AM", label: "9:00 AM", available: true },
    { value: "10:00 AM", label: "10:00 AM", available: true },
    { value: "11:00 AM", label: "11:00 AM", available: true },
    { value: "12:00 PM", label: "12:00 PM", available: true },
    { value: "01:00 PM", label: "1:00 PM", available: true },
    { value: "02:00 PM", label: "2:00 PM", available: true },
    { value: "03:00 PM", label: "3:00 PM", available: true },
    { value: "04:00 PM", label: "4:00 PM", available: true },
    { value: "05:00 PM", label: "5:00 PM", available: true },
    { value: "06:00 PM", label: "6:00 PM", available: true },
    { value: "07:00 PM", label: "7:00 PM", available: true },
    { value: "08:00 PM", label: "8:00 PM", available: true },
    { value: "09:00 PM", label: "9:00 PM", available: true }
  ];

  return (
    <FormField
      control={form.control}
      name="time"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            Available Times
          </FormLabel>
          
          {!selectedDate && (
            <Alert variant="default" className="bg-amber-50 text-amber-800 border-amber-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please select a date first to see available time slots
              </AlertDescription>
            </Alert>
          )}
          
          {selectedDate && !stylistId && (
            <Alert variant="default" className="bg-amber-50 text-amber-800 border-amber-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please select a stylist to see their available times
              </AlertDescription>
            </Alert>
          )}
          
          {noAvailableTimes && !loading && selectedDate && stylistId && (
            <Alert variant="default" className="bg-rose-50 text-rose-800 border-rose-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No available times for this date. Please select another date.
              </AlertDescription>
            </Alert>
          )}
          
          <Select 
            disabled={!selectedDate || !stylistId || loading || timeSlots.length === 0}
            onValueChange={field.onChange}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={
                  loading ? "Checking availability..." : 
                  !selectedDate ? "Select a date first" :
                  !stylistId ? "Select a stylist first" :
                  timeSlots.length === 0 ? "No available times" :
                  "Select a time"
                } />
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
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      {slot.label}
                    </div>
                  </SelectItem>
                ))
              ) : (!loading && selectedDate && stylistId) && (
                <div className="py-2 px-2 text-center text-sm text-muted-foreground">
                  No available time slots for this date
                </div>
              )}
            </SelectContent>
          </Select>
          
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TimeSlotSelector;
