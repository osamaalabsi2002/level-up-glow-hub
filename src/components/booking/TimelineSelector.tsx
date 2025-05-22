
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { useTimeSlots, type TimeSlot } from "@/hooks/booking/useTimeSlots";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Clock, Loader2 } from "lucide-react";
import TimeSlotGroup from "./TimeSlotGroup";
import AvailabilityLegend from "./AvailabilityLegend";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TimelineSelectorProps {
  form: UseFormReturn<any>;
  selectedDate: string;
  stylistId: number | null;
  serviceDuration: number;
}

const TimelineSelector = ({ form, selectedDate, stylistId, serviceDuration = 60 }: TimelineSelectorProps) => {
  const currentTime = form.getValues("time") || "";
  
  const { timeSlots, loading, noAvailableTimes, selectTimeSlot } = useTimeSlots(
    selectedDate, 
    stylistId, 
    serviceDuration,
    currentTime
  );

  // Handle time slot selection
  const handleTimeSlotSelect = (slot: TimeSlot) => {
    if (!slot.available || loading) return;
    
    // Check if the following slots needed for the service duration are available
    const slotIndex = timeSlots.findIndex(s => s.time === slot.time);
    const requiredSlots = Math.ceil(serviceDuration / 15);
    
    // Ensure we have enough consecutive available slots
    let hasEnoughSlots = true;
    for (let i = 0; i < requiredSlots; i++) {
      if (slotIndex + i >= timeSlots.length || !timeSlots[slotIndex + i].available) {
        hasEnoughSlots = false;
        break;
      }
    }
    
    if (!hasEnoughSlots) {
      console.log("Not enough consecutive available slots for this service duration");
      return;
    }
    
    // Update form with selected time
    form.setValue("time", slot.time, { 
      shouldValidate: true,
      shouldDirty: true 
    });
    
    // Update the UI to reflect the selection
    selectTimeSlot(slot.time);
  };
  
  // Render the timeline content based on state
  const renderTimelineContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-24">
          <Loader2 className="animate-spin h-6 w-6 text-salon-green" />
        </div>
      );
    }
    
    if (noAvailableTimes) {
      return (
        <Alert variant="default" className="bg-rose-50 text-rose-800 border-rose-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No available times for this date. Please select another date.
          </AlertDescription>
        </Alert>
      );
    }
    
    if (!selectedDate) {
      return (
        <Alert variant="default" className="bg-amber-50 text-amber-800 border-amber-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select a date first to see available time slots
          </AlertDescription>
        </Alert>
      );
    }
    
    if (!stylistId) {
      return (
        <Alert variant="default" className="bg-amber-50 text-amber-800 border-amber-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select a stylist to see their available times
          </AlertDescription>
        </Alert>
      );
    }
    
    // Group time slots by hour for better display
    const hourGroups: { [hour: string]: TimeSlot[] } = {};
    timeSlots.forEach(slot => {
      const hour = slot.time.split(':')[0] + slot.time.slice(slot.time.length - 2);
      if (!hourGroups[hour]) {
        hourGroups[hour] = [];
      }
      hourGroups[hour].push(slot);
    });
    
    return (
      <ScrollArea className="h-[200px] pr-4">
        <div className="space-y-2">
          {Object.entries(hourGroups).map(([hour, slots]) => (
            <TimeSlotGroup 
              key={hour} 
              hour={hour} 
              slots={slots} 
              onSelectSlot={handleTimeSlotSelect} 
              loading={loading}
            />
          ))}
        </div>
      </ScrollArea>
    );
  };

  return (
    <FormField
      control={form.control}
      name="time"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            Select a Time
          </FormLabel>
          
          <FormControl>
            <div className="border rounded-md p-3">
              {renderTimelineContent()}
              {!loading && !noAvailableTimes && selectedDate && stylistId && (
                <div className="mt-3 pt-2 border-t">
                  <AvailabilityLegend />
                </div>
              )}
            </div>
          </FormControl>
          
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TimelineSelector;
