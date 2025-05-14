
import { useEffect, useState } from "react";
import { format, addDays, isWeekend, isBefore, startOfDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";

interface DateSelectorProps {
  form: UseFormReturn<any>;
  handleDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  stylistId?: number | null;
}

const DateSelector = ({ form, handleDateChange, stylistId }: DateSelectorProps) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unavailableDays, setUnavailableDays] = useState<number[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  
  const today = new Date();
  const nextMonth = addDays(today, 30); // Allow booking up to 30 days in advance
  
  useEffect(() => {
    if (stylistId) {
      fetchStylistAvailableDays(stylistId);
      fetchDatesWithNoTimeSlots(stylistId);
    } else {
      // Reset unavailable days when no stylist is selected
      setUnavailableDays([]);
      setUnavailableDates([]);
    }
  }, [stylistId]);

  const fetchStylistAvailableDays = async (id: number) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('available_times')
        .select('day_of_week, is_available')
        .eq('stylist_id', id);
        
      if (error) throw error;
      
      if (data) {
        // Find days that are not available
        const unavailableDayNumbers = data
          .filter(day => !day.is_available)
          .map(day => day.day_of_week);
          
        setUnavailableDays(unavailableDayNumbers);
      }
    } catch (error) {
      console.error('Error fetching stylist available days:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // New function to fetch dates that have no available time slots
  const fetchDatesWithNoTimeSlots = async (id: number) => {
    try {
      setLoading(true);
      
      // Calculate date range to check (today to 30 days from now)
      const startDate = format(today, "yyyy-MM-dd");
      const endDate = format(nextMonth, "yyyy-MM-dd");
      
      // Get all bookings for this stylist in the date range
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('date, time')
        .eq('stylist_id', id)
        .gte('date', startDate)
        .lte('date', endDate)
        .neq('status', 'canceled');
      
      if (bookingsError) throw bookingsError;
      
      // Group bookings by date
      const bookingsByDate: Record<string, number> = {};
      bookings?.forEach(booking => {
        const dateStr = booking.date;
        bookingsByDate[dateStr] = (bookingsByDate[dateStr] || 0) + 1;
      });
      
      // For each date, check if there are any available slots
      const datesWithNoSlots: Date[] = [];
      const currentDate = new Date(today);
      
      while (currentDate <= nextMonth) {
        const dateStr = format(currentDate, "yyyy-MM-dd");
        const dayOfWeek = currentDate.getDay();
        
        // Skip if day of week is in unavailable days
        if (unavailableDays.includes(dayOfWeek)) {
          currentDate.setDate(currentDate.getDate() + 1);
          continue;
        }
        
        // Check if this day would have any slots available (max 13 slots per day - 9AM to 9PM)
        const totalSlotsPerDay = 13;
        const bookingsOnThisDate = bookingsByDate[dateStr] || 0;
        
        // If all slots are booked, this date has no available times
        if (bookingsOnThisDate >= totalSlotsPerDay) {
          datesWithNoSlots.push(new Date(currentDate));
        }
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      setUnavailableDates(datesWithNoSlots);
    } catch (error) {
      console.error('Error checking dates with no time slots:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to determine if a day should be disabled
  const disabledDays = (date: Date) => {
    const dayOfWeek = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
    
    // Check if the day is in the unavailable days array
    const isUnavailableDay = unavailableDays.includes(dayOfWeek);
    
    // Check if this specific date has no available slots
    const isDateUnavailable = unavailableDates.some(
      unavailableDate => 
        unavailableDate.getFullYear() === date.getFullYear() &&
        unavailableDate.getMonth() === date.getMonth() &&
        unavailableDate.getDate() === date.getDate()
    );
    
    // Disable past dates and dates more than a month in the future
    const isPastDate = isBefore(date, startOfDay(today));
    const isTooFarInFuture = date > nextMonth;
    
    return isPastDate || isTooFarInFuture || isUnavailableDay || isDateUnavailable;
  };

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
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn(
                    "pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value ? (
                    format(new Date(field.value), "MMMM d, yyyy")
                  ) : (
                    <span>{stylistId ? "Select available date" : "Select stylist first"}</span>
                  )}
                  {loading ? (
                    <Loader2 className="ml-auto h-4 w-4 animate-spin" />
                  ) : (
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  )}
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value ? new Date(field.value) : undefined}
                onSelect={handleSelectDate}
                disabled={disabledDays}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DateSelector;
