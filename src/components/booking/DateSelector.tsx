
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface DateSelectorProps {
  form: UseFormReturn<any>;
  handleDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const DateSelector = ({ form, handleDateChange }: DateSelectorProps) => {
  return (
    <FormField
      control={form.control}
      name="date"
      render={({ field: { value, ...fieldProps } }) => (
        <FormItem>
          <FormLabel>Date</FormLabel>
          <FormControl>
            <Input 
              type="date" 
              value={value}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => handleDateChange(e)}
              {...fieldProps} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DateSelector;
