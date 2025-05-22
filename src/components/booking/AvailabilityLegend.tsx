
const AvailabilityLegend = () => {
  return (
    <div className="flex gap-3 items-center text-sm mt-4">
      <div className="flex items-center gap-1">
        <div className="h-3 w-3 rounded-full bg-green-500"></div>
        <span>Available</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="h-3 w-3 rounded-full bg-rose-300"></div>
        <span>Unavailable</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="h-3 w-3 rounded-full bg-salon-green"></div>
        <span>Selected</span>
      </div>
    </div>
  );
};

export default AvailabilityLegend;
