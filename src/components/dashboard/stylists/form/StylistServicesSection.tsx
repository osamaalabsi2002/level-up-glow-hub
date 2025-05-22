
import { FormLabel, FormDescription } from "@/components/ui/form";
import ServiceSelector from "../../ServiceSelector";

interface StylistServicesSectionProps {
  selectedServiceIds: number[];
  setSelectedServiceIds: (ids: number[]) => void;
  isLoading: boolean;
}

const StylistServicesSection = ({ 
  selectedServiceIds, 
  setSelectedServiceIds, 
  isLoading
}: StylistServicesSectionProps) => {
  return (
    <div>
      <FormLabel>Services Offered</FormLabel>
      <FormDescription className="mb-2">
        Select the services this stylist can provide
      </FormDescription>
      
      <div className={isLoading ? "opacity-70 pointer-events-none" : ""}>
        <ServiceSelector 
          selectedServices={selectedServiceIds}
          onSelectionChange={setSelectedServiceIds}
          disabled={isLoading}
        />
      </div>
      
      {isLoading && (
        <div className="text-xs text-gray-500 mt-2">
          Loading or saving services, please wait...
        </div>
      )}
    </div>
  );
};

export default StylistServicesSection;
