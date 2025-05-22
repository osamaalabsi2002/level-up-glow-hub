
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { StylistFormValues } from "./types";

interface StylistAvailabilityFieldProps {
  form: UseFormReturn<StylistFormValues>;
}

const StylistAvailabilityField = ({ form }: StylistAvailabilityFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="available"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
          <div className="space-y-0.5">
            <FormLabel>Available</FormLabel>
            <FormDescription>
              Whether this stylist is currently available for bookings
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default StylistAvailabilityField;
