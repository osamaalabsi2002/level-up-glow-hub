
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

interface StylistExperienceFieldProps {
  form: UseFormReturn<StylistFormValues>;
}

const StylistExperienceField = ({ form }: StylistExperienceFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="experience"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Experience (Years)</FormLabel>
          <FormControl>
            <div className="space-y-2">
              <Slider
                min={1}
                max={30}
                step={1}
                defaultValue={[field.value]}
                onValueChange={(value) => field.onChange(value[0])}
              />
              <div className="text-right">{field.value} years</div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default StylistExperienceField;
