
import { useEffect, useState } from "react";
import { format, addDays, isWeekend } from "date-fns";
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
  
  const today = new Date();
  const nextMonth = addDays(today, 30); // Allow booking up to 30 days in advance
  
  useEffect(() => {
    if (stylistId) {
      fetchStylistAvailableDays(stylistId);
    } else {
      // Reset unavailable days when no stylist is selected
      setUnavailableDays([]);
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
  
  // Function to determine if a day should be disabled
  const disabledDays = (date: Date) => {
    const dayOfWeek = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
    
    // Check if the day is in the unavailable days array
    const isUnavailableDay = unavailableDays.includes(dayOfWeek);
    
    // Disable past dates and dates more than a month in the future
    const isPastDate = date < today;
    const isTooFarInFuture = date > nextMonth;
    
    return isPastDate || isTooFarInFuture || isUnavailableDay;
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
                    <span>Select date</span>
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
