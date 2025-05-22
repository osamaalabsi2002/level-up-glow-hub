
import { Calendar, Clock } from "lucide-react";

interface ServiceDurationDisplayProps {
  duration: number;
}

const ServiceDurationDisplay = ({ duration }: ServiceDurationDisplayProps) => {
  if (duration <= 0) return null;

  // Add different color schemes based on duration
  let colorScheme = "bg-blue-50 text-blue-800 border-blue-100";
  if (duration > 60) {
    colorScheme = "bg-purple-50 text-purple-800 border-purple-100";
  } else if (duration > 30) {
    colorScheme = "bg-emerald-50 text-emerald-800 border-emerald-100";
  }

  // Calculate recommended booking time slot (rounded up to nearest 30 min)
  const recommendedSlot = Math.ceil(duration / 30) * 30;

  return (
    <div className={`px-4 py-3 my-2 text-sm rounded-md border ${colorScheme} flex items-center justify-between`}>
      <p className="flex items-center font-medium">
        <Clock className="w-4 h-4 mr-2" />
        Service duration: <span className="font-bold ml-1">{duration} minutes</span>
      </p>
      <p className="flex items-center text-xs">
        <Calendar className="w-3 h-3 mr-1" />
        <span className="italic">Book {recommendedSlot} min slot</span>
      </p>
    </div>
  );
};

export default ServiceDurationDisplay;
