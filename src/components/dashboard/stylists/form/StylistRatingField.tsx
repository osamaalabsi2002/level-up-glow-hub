
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { UseFormReturn } from "react-hook-form";
import { StylistFormValues } from "./types";

interface StylistRatingFieldProps {
  form: UseFormReturn<StylistFormValues>;
}

const StylistRatingField = ({ form }: StylistRatingFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="rating"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Rating</FormLabel>
          <FormControl>
            <div className="space-y-2">
              <Slider
                min={1}
                max={5}
                step={0.1}
                defaultValue={[field.value]}
                onValueChange={(value) => field.onChange(value[0])}
              />
              <div className="text-right">{field.value.toFixed(1)} stars</div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default StylistRatingField;
