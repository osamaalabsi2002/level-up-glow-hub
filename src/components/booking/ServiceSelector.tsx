
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
}

const ServiceSelector = ({ form, services, multiSelect = false }: ServiceSelectorProps) => {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  // Initialize selected services from form values
  useEffect(() => {
    const formServices = form.getValues("services");
    if (formServices && Array.isArray(formServices)) {
      setSelectedServices(formServices);
    } else if (formServices && typeof formServices === 'string') {
      setSelectedServices([formServices]);
    }
  }, [form]);

  // Handle single service selection via dropdown
  const handleSingleServiceChange = (value: string) => {
    form.setValue("services", [value], {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  // Handle checkbox toggle for multi-select
  const handleServiceToggle = (checked: boolean, service: string) => {
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
  };

  return (
    <FormField
      control={form.control}
      name="services"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Service{multiSelect ? 's' : ''}</FormLabel>
          
          {multiSelect ? (
            <div className="space-y-2">
              {services.map((service) => (
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
              ))}
              {selectedServices.length === 0 && (
                <FormMessage>Please select at least one service</FormMessage>
              )}
            </div>
          ) : (
            <>
              <FormControl>
                <Select 
                  onValueChange={(value) => handleSingleServiceChange(value)}
                  value={field.value?.[0] || ""}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
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
