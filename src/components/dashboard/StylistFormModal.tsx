
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Stylist } from "@/types/dashboard";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StylistFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (stylist: Partial<Stylist>) => void;
  editStylist?: Stylist;
}

// Zod schema for form validation
const stylistFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  role: z.string().min(2, { message: "Role is required" }),
  image: z.string().url({ message: "Please enter a valid image URL" }),
  bio: z.string().optional(),
  specialties: z.array(z.string()).min(1, { message: "At least one specialty is required" }),
  rating: z.number().min(1).max(5),
  available: z.boolean(),
  experience: z.number().min(1).max(30),
  user_id: z.string().optional(),
});

type StylistFormValues = z.infer<typeof stylistFormSchema>;

const StylistFormModal = ({ isOpen, onClose, onSave, editStylist }: StylistFormModalProps) => {
  const [existingUsers, setExistingUsers] = useState<Array<{ id: string; email: string }>>([]);
  const [specialtyInput, setSpecialtyInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize the form with default values or edit values
  const form = useForm<StylistFormValues>({
    resolver: zodResolver(stylistFormSchema),
    defaultValues: editStylist ? {
      name: editStylist.name,
      role: editStylist.role,
      image: editStylist.image,
      bio: editStylist.bio || "",
      specialties: editStylist.specialties || [],
      rating: editStylist.rating,
      available: editStylist.available,
      experience: editStylist.experience,
      user_id: undefined,
    } : {
      name: "",
      role: "مصففة شعر",
      image: "https://source.unsplash.com/random/300x300/?hairstylist",
      bio: "",
      specialties: [],
      rating: 5.0,
      available: true,
      experience: 1,
      user_id: undefined,
    },
  });

  useEffect(() => {
    // Fetch users for the dropdown
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        // Fetch profiles that don't already have a stylist entry
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email:full_name')
          .neq('role', 'stylist')
          .order('full_name', { ascending: true });
        
        if (error) throw error;
        
        if (data) {
          setExistingUsers(data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Could not load available users');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  // Handle form submission
  const onSubmit = async (values: StylistFormValues) => {
    try {
      onSave(values);
      form.reset();
      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-salon-green text-xl mb-4">
            {editStylist ? "Edit Stylist" : "Add New Stylist"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Stylist name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role/Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Hair Stylist" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="Image URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Stylist bio"
                      className="h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            {!editStylist && (
              <FormField
                control={form.control}
                name="user_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Associate with User (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a user to associate with this stylist" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None (Create without user)</SelectItem>
                        {existingUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      This will allow the user to log in and access the stylist dashboard
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-salon-green hover:bg-salon-darkGreen text-white"
              >
                {editStylist ? "Update Stylist" : "Add Stylist"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default StylistFormModal;
