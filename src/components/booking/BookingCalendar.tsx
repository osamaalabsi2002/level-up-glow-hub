
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface BookingCalendarProps {
  date: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  isDisabled: (date: Date) => boolean;
  loading: boolean;
  disabled?: boolean;
  calendarOpen: boolean;
  setCalendarOpen: (open: boolean) => void;
  placeholder: string;
}

const BookingCalendar = ({
  date,
  onSelect,
  isDisabled,
  loading,
  disabled = false,
  calendarOpen,
  setCalendarOpen,
  placeholder
}: BookingCalendarProps) => {
  return (
    <Popover open={calendarOpen && !disabled} onOpenChange={(open) => !disabled && setCalendarOpen(open)}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "pl-3 text-left font-normal w-full",
            !date && "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          disabled={disabled}
        >
          {date ? (
            format(date, "MMMM d, yyyy")
          ) : (
            <span>{placeholder}</span>
          )}
          {loading ? (
            <Loader2 className="ml-auto h-4 w-4 animate-spin" />
          ) : (
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onSelect}
          disabled={isDisabled}
          initialFocus
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
};

export default BookingCalendar;
