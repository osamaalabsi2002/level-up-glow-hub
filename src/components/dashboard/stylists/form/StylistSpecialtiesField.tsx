
import { useState } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { StylistFormValues } from "./types";

interface StylistSpecialtiesFieldProps {
  form: UseFormReturn<StylistFormValues>;
}

const StylistSpecialtiesField = ({ form }: StylistSpecialtiesFieldProps) => {
  const [specialtyInput, setSpecialtyInput] = useState("");

  // Handle adding a specialty
  const handleAddSpecialty = () => {
    if (specialtyInput.trim() !== "") {
      const currentSpecialties = form.getValues("specialties") || [];
      
      // Check if the specialty already exists
      if (!currentSpecialties.includes(specialtyInput)) {
        form.setValue("specialties", [...currentSpecialties, specialtyInput]);
        setSpecialtyInput("");
      } else {
        toast.error("This specialty is already added");
      }
    }
  };

  // Handle removing a specialty
  const handleRemoveSpecialty = (specialty: string) => {
    const currentSpecialties = form.getValues("specialties");
    form.setValue(
      "specialties",
      currentSpecialties.filter((s) => s !== specialty)
    );
  };

  return (
    <FormField
      control={form.control}
      name="specialties"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Specialties</FormLabel>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Add a specialty"
              value={specialtyInput}
              onChange={(e) => setSpecialtyInput(e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={handleAddSpecialty}
              className="bg-salon-green hover:bg-salon-darkGreen text-white"
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {field.value?.map((specialty) => (
              <div
                key={specialty}
                className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1"
              >
                <span>{specialty}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSpecialty(specialty)}
                  className="text-red-500 font-bold text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default StylistSpecialtiesField;
