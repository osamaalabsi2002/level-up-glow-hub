import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TIME_OPTIONS } from "@/utils/availabilityUtils";

interface DayAvailabilityRowProps {
  dayName: string;
  dayIndex: number;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
  onToggle: (dayIndex: number) => void;
  onTimeChange: (dayIndex: number, field: 'start_time' | 'end_time', value: string) => void;
}

const DayAvailabilityRow = ({
  dayName,
  dayIndex,
  isAvailable,
  startTime,
  endTime,
  onToggle,
  onTimeChange
}: DayAvailabilityRowProps) => {
  return (
    <div className="grid grid-cols-[80px_1fr] gap-4 items-center">
      <div className="flex items-center gap-2">
        <Switch 
          checked={isAvailable}
          onCheckedChange={() => onToggle(dayIndex)}
        />
        <Label>{dayName}</Label>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <Select
          disabled={!isAvailable}
          value={startTime}
          onValueChange={(value) => onTimeChange(dayIndex, 'start_time', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Start time" />
          </SelectTrigger>
          <SelectContent>
            {TIME_OPTIONS.map((time) => (
              <SelectItem key={time.value} value={time.value}>
                {time.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          disabled={!isAvailable}
          value={endTime}
          onValueChange={(value) => onTimeChange(dayIndex, 'end_time', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="End time" />
          </SelectTrigger>
          <SelectContent>
            {TIME_OPTIONS.map((time) => (
              <SelectItem key={time.value} value={time.value}>
                {time.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default DayAvailabilityRow;
