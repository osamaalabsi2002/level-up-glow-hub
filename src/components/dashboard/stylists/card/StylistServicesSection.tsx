
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Scissors } from "lucide-react";
import { Service } from "@/types/dashboard";
import { useStylistOperations } from "@/hooks/useStylistOperations";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StylistServicesSectionProps {
  stylistId: number;
}

const StylistServicesSection = ({ stylistId }: StylistServicesSectionProps) => {
  const [services, setServices] = useState<Service[]>([]);
  const { fetchStylistServices } = useStylistOperations([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadServices = async () => {
      setLoading(true);
      try {
        const stylistServices = await fetchStylistServices(stylistId);
        setServices(stylistServices);
      } catch (error) {
        console.error("Error loading stylist services:", error);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [stylistId, fetchStylistServices]);

  return (
    <div className="mb-3">
      <div className="flex items-center gap-1 mb-1 text-sm font-medium text-gray-700">
        <Scissors className="h-3.5 w-3.5" />
        <span>Services:</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {loading ? (
          <span className="text-xs text-gray-500">Loading services...</span>
        ) : services.length > 0 ? (
          <>
            {services.slice(0, 2).map((service) => (
              <TooltipProvider key={service.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="secondary" className="bg-blue-50 text-xs">
                      {service.name}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>${service.price} - {service.duration} mins</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
            {services.length > 2 && (
              <Badge variant="secondary" className="bg-blue-50 text-xs">
                +{services.length - 2} more
              </Badge>
            )}
          </>
        ) : (
          <span className="text-xs text-gray-500">No services assigned</span>
        )}
      </div>
    </div>
  );
};

export default StylistServicesSection;
