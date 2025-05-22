
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { useState, useEffect } from "react";

interface Service {
  id: string;
  label: string;
}

interface ServiceSelectorProps {
  form: UseFormReturn<any>;
  services: Service[];
  multiSelect?: boolean;
  isLoading?: boolean;
  onServiceSelect?: (services: string[]) => void;
}

const ServiceSelector = ({ 
  form, 
  services, 
  multiSelect = false, 
  isLoading = false, 
  onServiceSelect
}: ServiceSelectorProps) => {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  // Initialize selected services from form values
  useEffect(() => {
    const formServices = form.getValues("services");
    console.log("Initial form services:", formServices);
    
    if (formServices && Array.isArray(formServices)) {
      setSelectedServices(formServices);
    } else if (formServices && typeof formServices === 'string') {
      setSelectedServices([formServices]);
    }
  }, [form]);

  // Handle single service selection via dropdown
  const handleSingleServiceChange = (value: string) => {
    if (!value) return; // Prevent empty string values
    
    console.log("Selected service value:", value);
    const updatedServices = [value];
    
    form.setValue("services", updatedServices, {
      shouldValidate: true,
      shouldDirty: true,
    });
    
    setSelectedServices(updatedServices);
    
    if (onServiceSelect) {
      onServiceSelect(updatedServices);
    }
    
    console.log("Selected single service:", value);
  };

  // Handle checkbox toggle for multi-select
  const handleServiceToggle = (checked: boolean, service: string) => {
    if (!service) return; // Prevent empty string values
    
    console.log("Toggle service:", service, checked);
    let updatedServices = [...selectedServices];
    
    if (checked) {
      updatedServices.push(service);
    } else {
      updatedServices = updatedServices.filter(s => s !== service);
    }
    
    setSelectedServices(updatedServices);
    
    form.setValue("services", updatedServices, {
      shouldValidate: true,
      shouldDirty: true,
    });
    
    if (onServiceSelect) {
      onServiceSelect(updatedServices);
    }
    
    console.log("Updated selected services:", updatedServices);
  };

  // Filter out any invalid services that might have empty IDs
  const validServices = services.filter(service => service && service.id);

  return (
    <FormField
      control={form.control}
      name="services"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Service{multiSelect ? 's' : ''}</FormLabel>
          
          {multiSelect ? (
            <div className="space-y-2">
              {isLoading ? (
                <p className="text-sm text-gray-500">Loading services...</p>
              ) : validServices.length === 0 ? (
                <p className="text-sm text-amber-600">No services found</p>
              ) : (
                validServices.map((service) => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`service-${service.id}`}
                      checked={selectedServices.includes(service.id)}
                      onCheckedChange={(checked) => 
                        handleServiceToggle(checked as boolean, service.id)
                      }
                    />
                    <label
                      htmlFor={`service-${service.id}`}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {service.label}
                    </label>
                  </div>
                ))
              )}
            </div>
          ) : (
            <>
              <FormControl>
                <Select 
                  onValueChange={(value) => handleSingleServiceChange(value)}
                  value={field.value?.[0] || undefined}
                  disabled={isLoading || validServices.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={
                      isLoading 
                        ? "Loading services..." 
                        : validServices.length === 0 
                          ? "No services found" 
                          : "Select a service"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {validServices.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </>
          )}
        </FormItem>
      )}
    />
  );
};

export default ServiceSelector;
