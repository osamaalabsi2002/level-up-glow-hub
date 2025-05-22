export interface DayAvailability {
  id?: number;
  stylist_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export const DAYS_OF_WEEK = [
  { label: 'Sunday', value: 0 },
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
];

export const TIME_OPTIONS = [
  { label: '6:00 AM', value: '06:00:00' },
  { label: '6:30 AM', value: '06:30:00' },
  { label: '7:00 AM', value: '07:00:00' },
  { label: '7:30 AM', value: '07:30:00' },
  { label: '8:00 AM', value: '08:00:00' },
  { label: '8:30 AM', value: '08:30:00' },
  { label: '9:00 AM', value: '09:00:00' },
  { label: '9:30 AM', value: '09:30:00' },
  { label: '10:00 AM', value: '10:00:00' },
  { label: '10:30 AM', value: '10:30:00' },
  { label: '11:00 AM', value: '11:00:00' },
  { label: '11:30 AM', value: '11:30:00' },
  { label: '12:00 PM', value: '12:00:00' },
  { label: '12:30 PM', value: '12:30:00' },
  { label: '1:00 PM', value: '13:00:00' },
  { label: '1:30 PM', value: '13:30:00' },
  { label: '2:00 PM', value: '14:00:00' },
  { label: '2:30 PM', value: '14:30:00' },
  { label: '3:00 PM', value: '15:00:00' },
  { label: '3:30 PM', value: '15:30:00' },
  { label: '4:00 PM', value: '16:00:00' },
  { label: '4:30 PM', value: '16:30:00' },
  { label: '5:00 PM', value: '17:00:00' },
  { label: '5:30 PM', value: '17:30:00' },
  { label: '6:00 PM', value: '18:00:00' },
  { label: '6:30 PM', value: '18:30:00' },
  { label: '7:00 PM', value: '19:00:00' },
  { label: '7:30 PM', value: '19:30:00' },
  { label: '8:00 PM', value: '20:00:00' },
  { label: '8:30 PM', value: '20:30:00' },
  { label: '9:00 PM', value: '21:00:00' },
  { label: '9:30 PM', value: '21:30:00' },
  { label: '10:00 PM', value: '22:00:00' },
];

export const validateTimeRanges = (availability: DayAvailability[]): boolean => {
  for (const day of availability) {
    if (!day.is_available) continue;
    
    const start = new Date(`1970-01-01T${day.start_time}`);
    const end = new Date(`1970-01-01T${day.end_time}`);
    
    if (start >= end) {
      console.error(`Invalid time range for day ${day.day_of_week}: ${day.start_time} - ${day.end_time}`);
      return false;
    }
  }
  return true;
};

export const createDefaultAvailability = (stylistId: number): DayAvailability[] => {
  // Create default availability for all days (10 AM to 6 PM, Monday-Friday)
  return DAYS_OF_WEEK.map(day => ({
    stylist_id: stylistId,
    day_of_week: day.value,
    start_time: day.value >= 1 && day.value <= 5 ? '10:00:00' : '12:00:00',
    end_time: day.value >= 1 && day.value <= 5 ? '18:00:00' : '16:00:00',
    is_available: day.value >= 1 && day.value <= 5 // Monday-Friday available by default
  }));
};

// Format time for display (24h to 12h format)
export const formatTime = (time: string): string => {
  if (!time) return '';
  
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  
  return `${hour12}:${minutes} ${ampm}`;
};

// Parse time string to Date object
export const parseTime = (timeString: string): Date => {
  return new Date(`1970-01-01T${timeString}`);
};
