import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { DAYS_OF_WEEK } from "@/utils/availabilityUtils";
import DayAvailabilityRow from "./DayAvailabilityRow";
import { useAvailabilityManager } from "@/hooks/useAvailabilityManager";

interface WeeklyScheduleProps {
  stylistId?: number | null;
}

const WeeklySchedule = ({ stylistId }: WeeklyScheduleProps) => {
  const {
    loading,
    saving,
    availability,
    error,
    handleToggleDay,
    handleTimeChange,
    handleSaveAvailability
  } = useAvailabilityManager(stylistId);

  return (
    <>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="p-4 border border-red-200 bg-red-50 rounded-md">
            <p className="text-red-600">{error}</p>
            <p className="text-sm text-red-500 mt-1">Please try again or contact support if the issue persists.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {DAYS_OF_WEEK.map((day) => {
              const dayAvailability = availability.find(a => a.day_of_week === day.value);
              
              if (!dayAvailability) return null;
              
              return (
                <DayAvailabilityRow
                  key={day.value}
                  dayName={day.label}
                  dayIndex={day.value}
                  isAvailable={dayAvailability.is_available || false}
                  startTime={dayAvailability.start_time || "09:00"}
                  endTime={dayAvailability.end_time || "17:00"}
                  onToggle={handleToggleDay}
                  onTimeChange={handleTimeChange}
                />
              );
            })}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <Button
          onClick={handleSaveAvailability}
          disabled={saving || loading}
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Availability
        </Button>
      </CardFooter>
    </>
  );
};

export default WeeklySchedule;
