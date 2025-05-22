
import { useState, useEffect } from 'react';
import { format, parse, isToday, addDays } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Booking } from "@/types/dashboard";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Clock, 
  User
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BookingsTimelineProps {
  bookings: Booking[];
  loading: boolean;
}

const BookingsTimeline = ({ bookings, loading }: BookingsTimelineProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [timeSlots, setTimeSlots] = useState<{
    hour: number;
    minute: number;
    time: string;
    bookings: Booking[];
  }[]>([]);

  // Business hours
  const businessHours = {
    start: 9, // 9 AM
    end: 21,  // 9 PM
  };

  // Filter bookings for the selected date
  useEffect(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const filtered = bookings.filter(booking => booking.date === dateStr);
    setFilteredBookings(filtered);
    
    // Generate timeline with 15-minute slots
    generateTimelineSlots(filtered);
  }, [selectedDate, bookings]);

  // Generate timeline slots for the day
  const generateTimelineSlots = (dateBookings: Booking[]) => {
    const slots = [];
    
    // Generate 15-minute time slots between business hours
    for (let hour = businessHours.start; hour < businessHours.end; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeStr = format(new Date().setHours(hour, minute), 'HH:mm:ss');
        const displayTime = format(new Date().setHours(hour, minute), 'h:mm a');
        
        // Find bookings that start at this time slot
        const slotBookings = dateBookings.filter(booking => booking.time === timeStr);
        
        slots.push({
          hour,
          minute,
          time: displayTime,
          bookings: slotBookings
        });
      }
    }
    
    setTimeSlots(slots);
  };

  // Navigate to previous day
  const goToPrevDay = () => {
    setSelectedDate(prev => addDays(prev, -1));
  };

  // Navigate to next day
  const goToNextDay = () => {
    setSelectedDate(prev => addDays(prev, 1));
  };

  // Go to today
  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "completed":
        return <Badge className="bg-blue-500">Completed</Badge>;
      case "canceled":
        return <Badge className="bg-red-500">Canceled</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  // Render booking card
  const renderBookingCard = (booking: Booking) => {
    return (
      <Card key={booking.id} className="mb-2 bg-white shadow-sm border-l-4 border-l-salon-green">
        <CardHeader className="py-2 px-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium">
              <div className="flex items-center">
                <User className="h-3 w-3 mr-1" />
                {booking.clientName}
              </div>
            </CardTitle>
            {getStatusBadge(booking.status)}
          </div>
        </CardHeader>
        <CardContent className="py-1 px-3">
          <div className="text-xs text-gray-600">
            <div className="flex items-center mb-1">
              <Clock className="h-3 w-3 mr-1" />
              {format(parse(booking.time, 'HH:mm:ss', new Date()), 'h:mm a')}
              {booking.duration && (
                <span className="ml-1">({booking.duration} min)</span>
              )}
            </div>
            <div className="flex items-center">
              <span className="font-medium">Service:</span>
              <span className="ml-1">{booking.service}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Appointments Timeline</h3>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToPrevDay}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant={isToday(selectedDate) ? "default" : "outline"} 
            size="sm" 
            onClick={goToToday}
            className={isToday(selectedDate) ? "bg-salon-green" : ""}
          >
            Today
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToNextDay}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="ml-2 text-sm font-medium">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </span>
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-600">No appointments scheduled for this day</p>
          <p className="text-sm text-gray-500 mt-1">Select another date or check upcoming appointments</p>
        </div>
      ) : (
        <div className="bg-white border rounded-md">
          <div className="grid grid-cols-[80px_1fr] divide-x">
            {/* Time column */}
            <div className="border-r">
              {timeSlots.filter(slot => slot.minute === 0).map((hourSlot) => (
                <div 
                  key={`hour-${hourSlot.hour}`} 
                  className="h-16 px-2 py-1 text-right text-sm text-gray-500 font-medium border-b"
                >
                  {hourSlot.time}
                </div>
              ))}
            </div>
            
            {/* Bookings column */}
            <div className="relative">
              {/* Grid lines for hours */}
              {timeSlots.filter(slot => slot.minute === 0).map((hourSlot, index) => (
                <div 
                  key={`grid-${hourSlot.hour}`} 
                  className="h-16 border-b border-dashed border-gray-200"
                ></div>
              ))}
              
              {/* Bookings placed on the timeline */}
              {filteredBookings.map((booking) => {
                const bookingTime = parse(booking.time, 'HH:mm:ss', new Date());
                const bookingHour = bookingTime.getHours();
                const bookingMinute = bookingTime.getMinutes();
                
                // Calculate position from top
                const hourDiff = bookingHour - businessHours.start;
                const minutePercentage = bookingMinute / 60;
                const positionFromTop = (hourDiff + minutePercentage) * 64; // 64px per hour
                
                // Calculate height based on duration
                const durationHeight = ((booking.duration || 60) / 60) * 64;
                
                return (
                  <div
                    key={`booking-${booking.id}`}
                    className="absolute left-2 right-2"
                    style={{
                      top: `${positionFromTop}px`,
                      height: `${durationHeight}px`,
                      minHeight: '32px',
                      maxHeight: `${durationHeight}px`,
                      overflow: 'hidden'
                    }}
                  >
                    {renderBookingCard(booking)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsTimeline;
