
import TimelineSelector from "./TimelineSelector";
import { UseFormReturn } from "react-hook-form";

interface TimeSlotSelectorProps {
  form: UseFormReturn<any>;
  selectedDate: string;
  stylistId: number | null;
  serviceDuration?: number;
}

// This component now serves as a wrapper for TimelineSelector
// for backwards compatibility
const TimeSlotSelector = ({ form, selectedDate, stylistId, serviceDuration = 60 }: TimeSlotSelectorProps) => {
  return (
    <TimelineSelector 
      form={form}
      selectedDate={selectedDate}
      stylistId={stylistId}
      serviceDuration={serviceDuration}
    />
  );
};

export default TimeSlotSelector;
