
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type TimeSlot } from "@/hooks/booking/useTimeSlots";

interface TimeSlotGroupProps {
  hour: string;
  slots: TimeSlot[];
  onSelectSlot: (slot: TimeSlot) => void;
  loading: boolean;
}

const TimeSlotGroup = ({ hour, slots, onSelectSlot, loading }: TimeSlotGroupProps) => {
  return (
    <div className="mb-2">
      <div className="text-sm font-medium text-gray-500 mb-1">{hour}</div>
      <div className="flex flex-wrap gap-1">
        {slots.map((slot) => {
          const minutes = slot.time.split(':')[1].slice(0, 2);
          return (
            <Button
              key={slot.time}
              type="button"
              size="sm"
              variant="outline"
              className={cn(
                "rounded py-1 px-2 text-xs transition-all",
                slot.selected && "border-salon-green bg-salon-green text-white",
                !slot.available && "opacity-50 cursor-not-allowed bg-rose-100 border-rose-200",
                slot.available && !slot.selected && "hover:border-salon-green"
              )}
              disabled={!slot.available || loading}
              onClick={() => onSelectSlot(slot)}
            >
              {minutes}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default TimeSlotGroup;
