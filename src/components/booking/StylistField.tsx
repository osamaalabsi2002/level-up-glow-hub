
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface StylistFieldProps {
  form: UseFormReturn<any>;
}

const StylistField = ({ form }: StylistFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="stylist"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Preferred Stylist (Optional)</FormLabel>
          <FormControl>
            <Input placeholder="Enter stylist name (if any)" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default StylistField;
