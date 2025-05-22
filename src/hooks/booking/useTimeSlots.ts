import { useState, useEffect } from "react";
import { format, parse, addMinutes } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

export interface TimeSlot {
  time: string; // In format "09:00 AM"
  available: boolean;
  selected: boolean;
  startMinute: number; // Minutes from start of day
  endMinute: number;   // Minutes from start of day
}

export const useTimeSlots = (
  selectedDate: string, 
  stylistId: number | null, 
  serviceDuration: number,
  currentSelectedTime: string
) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [noAvailableTimes, setNoAvailableTimes] = useState(false);
  const [businessHours, setBusinessHours] = useState({
    startHour: 9, // 9 AM
    endHour: 21,  // 9 PM
  });

  // Generate time slots for the day based on business hours
  const generateTimeSlots = () => {
    const slots: TimeSlot[] = [];
    
    // Generate 15-minute time slots
    for (let hour = businessHours.startHour; hour < businessHours.endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = format(new Date().setHours(hour, minute), "hh:mm a");
        const startMinute = hour * 60 + minute;
        const endMinute = startMinute + 15;
        
        slots.push({
          time: timeString,
          available: true, // Will be updated with actual availability
          selected: timeString === currentSelectedTime,
          startMinute,
          endMinute
        });
      }
    }
    
    return slots;
  };

  useEffect(() => {
    if (selectedDate && stylistId && serviceDuration > 0) {
      checkAvailableTimeSlots();
    } else {
      // Reset time slots if no date or stylist selected
      setTimeSlots([]);
      setNoAvailableTimes(false);
    }
  }, [selectedDate, stylistId, serviceDuration, currentSelectedTime]);

  // Check available time slots considering the service duration
  const checkAvailableTimeSlots = async () => {
    if (!selectedDate || !stylistId) {
      return setTimeSlots([]);
    }

    try {
      setLoading(true);
      console.log("Checking availability for date:", selectedDate, "and stylist:", stylistId, "with service duration:", serviceDuration);
      
      // Start with all time slots from business hours
      const initialTimeSlots = generateTimeSlots();
      
      // Get stylist's working hours for the selected day of week
      const dayOfWeek = new Date(selectedDate).getDay();
      const { data: availableTimesData } = await supabase
        .from('available_times')
        .select('start_time, end_time, is_available')
        .eq('stylist_id', stylistId)
        .eq('day_of_week', dayOfWeek);
      
      // Get existing bookings for the stylist on this date
      // Include all non-canceled bookings (pending and confirmed)
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('time, duration, status')
        .eq('stylist_id', stylistId)
        .eq('date', selectedDate)
        .in('status', ['pending', 'confirmed', 'completed']);
        
      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
        throw bookingsError;
      }
      
      console.log(`Found ${bookingsData?.length || 0} existing bookings for this date`);
      
      // Process all time slots and mark them as available or not
      const processedTimeSlots = initialTimeSlots.map(slot => {
        // Parse the time slot
        const slotTime = parse(slot.time, 'hh:mm a', new Date());
        const slotHour = slotTime.getHours();
        const slotMinute = slotTime.getMinutes();
        const slotTimeString = format(slotTime, 'HH:mm:ss');
        
        // Check if the time is within stylist's working hours
        let withinWorkingHours = false;
        if (availableTimesData) {
          for (const availTime of availableTimesData) {
            if (!availTime.is_available) continue;
            
            const startTime = parse(availTime.start_time, 'HH:mm:ss', new Date());
            const endTime = parse(availTime.end_time, 'HH:mm:ss', new Date());
            
            // The time slot is within working hours if it starts after or at start time
            // and if the service would end before or at end time
            const serviceEndTime = addMinutes(slotTime, serviceDuration);
            
            if (
              (slotHour > startTime.getHours() || 
               (slotHour === startTime.getHours() && slotMinute >= startTime.getMinutes())) &&
              (serviceEndTime.getHours() < endTime.getHours() || 
               (serviceEndTime.getHours() === endTime.getHours() && serviceEndTime.getMinutes() <= endTime.getMinutes()))
            ) {
              withinWorkingHours = true;
              break;
            }
          }
        }
        
        // If not within working hours, mark as unavailable
        if (!withinWorkingHours) {
          return { ...slot, available: false };
        }
        
        // Check if the slot conflicts with any existing bookings
        let conflictsWithBooking = false;
        
        if (bookingsData && bookingsData.length > 0) {
          // Convert the current slot time to minutes since midnight for easier comparison
          const slotStartMinutes = slotHour * 60 + slotMinute;
          const slotEndMinutes = slotStartMinutes + serviceDuration;
          
          for (const booking of bookingsData) {
            try {
              // Parse booking time
              const bookingTime = parse(booking.time, 'HH:mm:ss', new Date());
              const bookingStartMinutes = bookingTime.getHours() * 60 + bookingTime.getMinutes();
              const bookingDuration = booking.duration || 60; // Default to 60 minutes if no duration specified
              const bookingEndMinutes = bookingStartMinutes + bookingDuration;
              
              // Check if there's an overlap between the current slot and this booking
              // Slot starts during booking OR booking starts during slot
              if (
                (slotStartMinutes < bookingEndMinutes && slotEndMinutes > bookingStartMinutes) ||
                (bookingStartMinutes < slotEndMinutes && bookingEndMinutes > slotStartMinutes)
              ) {
                console.log(`Slot ${slot.time} conflicts with booking at ${booking.time} (${booking.status})`);
                conflictsWithBooking = true;
                break;
              }
            } catch (parseError) {
              console.error('Error parsing booking time:', booking.time, parseError);
            }
          }
        }
        
        return { 
          ...slot, 
          available: !conflictsWithBooking 
        };
      });
      
      // Count available slots
      const availableCount = processedTimeSlots.filter(slot => slot.available).length;
      setNoAvailableTimes(availableCount === 0);
      
      // Update state
      setTimeSlots(processedTimeSlots);
      
    } catch (error) {
      console.error('Error checking time slots:', error);
      setTimeSlots([]);
      setNoAvailableTimes(true);
    } finally {
      setLoading(false);
    }
  };

  // Mark this slot as selected and others as unselected
  const selectTimeSlot = (selectedTime: string) => {
    const updatedTimeSlots = timeSlots.map(s => ({
      ...s,
      selected: s.time === selectedTime
    }));
    
    setTimeSlots(updatedTimeSlots);
  };

  return {
    timeSlots,
    loading,
    noAvailableTimes,
    selectTimeSlot
  };
};
