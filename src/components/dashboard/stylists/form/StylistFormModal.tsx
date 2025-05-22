import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Check } from "lucide-react";
import { Stylist } from "@/types/dashboard";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { useStylistServices } from "@/hooks/useStylistServices";
import { stylistFormSchema, StylistFormValues } from "./types";
import StylistBasicInfoFields from "./StylistBasicInfoFields";
import StylistSpecialtiesField from "./StylistSpecialtiesField";
import StylistExperienceField from "./StylistExperienceField";
import StylistRatingField from "./StylistRatingField";
import StylistAvailabilityField from "./StylistAvailabilityField";
import { Input } from "@/components/ui/input";
import { z } from "zod";

interface StylistFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (stylist: Partial<Stylist>) => Promise<Stylist | null> | Stylist | null;
  editStylist?: Stylist;
}

// Extended form values to include email and password
interface ExtendedStylistFormValues extends StylistFormValues {
  email?: string;
  password?: string;
}

const StylistFormModal = ({ isOpen, onClose, onSave, editStylist }: StylistFormModalProps) => {
  const [existingUsers, setExistingUsers] = useState<Array<{ id: string; email: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [usersFetchError, setUsersFetchError] = useState<string | null>(null);
  const [savedStylistId, setSavedStylistId] = useState<number | null>(null);
  const [allServices, setAllServices] = useState<number[]>([]);
  const stylistId = savedStylistId || editStylist?.id || null;
  
  console.log("StylistFormModal render:", { 
    editStylist: editStylist?.id, 
    savedStylistId,
    stylistId,
    isOpen 
  });
  
  // Use our hook for handling stylist services
  const { 
    selectedServiceIds, 
    setSelectedServiceIds,
    loadStylistServices, 
    updateStylistServices,
    loading: servicesLoading
  } = useStylistServices(stylistId);

  // Initialize the form with default values or edit values
  const form = useForm<ExtendedStylistFormValues>({
    resolver: zodResolver(stylistFormSchema.extend({
      email: editStylist ? z.string().optional() : z.string().email('Please enter a valid email'),
      password: editStylist ? z.string().optional() : z.string().min(6, 'Password must be at least 6 characters')
    })),
    defaultValues: editStylist ? {
      name: editStylist.name,
      role: editStylist.role,
      image: editStylist.image,
      bio: editStylist.bio || "",
      specialties: editStylist.specialties || [],
      rating: editStylist.rating,
      available: editStylist.available,
      experience: editStylist.experience,
      user_id: editStylist.user_id,
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
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    // Reset saved stylist ID when modal closes
    if (!isOpen) {
      setSavedStylistId(null);
    }
  }, [isOpen]);

  // Fetch all services when the modal opens (once)
  useEffect(() => {
    const fetchAllServices = async () => {
      // Skip if we already have services
      if (allServices.length > 0) {
        return;
      }
      
      try {
        // Try to use cached services data
        const cachedServices = localStorage.getItem('cached_all_services');
        const cacheTimestamp = localStorage.getItem('cached_all_services_timestamp');
        const now = Date.now();
        const cacheAge = cacheTimestamp ? now - parseInt(cacheTimestamp) : Infinity;
        
        // Use cache if it's less than 10 minutes old
        if (cachedServices && cacheAge < 600000) {
          try {
            const serviceIds = JSON.parse(cachedServices);
            console.log(`Using cached services (${serviceIds.length} services)`);
            setAllServices(serviceIds);
            
            // If we're not editing a stylist, pre-select all services
            if (!editStylist) {
              setSelectedServiceIds(serviceIds);
            }
            return;
          } catch (e) {
            console.error('Error parsing cached services:', e);
            // Continue with fetch if cache parse fails
          }
        }
        
        // Fetch if no valid cache
        const { data, error } = await supabase
          .from('services')
          .select('id');
          
        if (error) {
          console.error('Error fetching services:', error);
          return;
        }
        
        if (data) {
          const serviceIds = data.map(service => service.id);
          setAllServices(serviceIds);
          console.log(`Fetched ${serviceIds.length} services for auto-assignment`);
          
          // Cache the results
          try {
            localStorage.setItem('cached_all_services', JSON.stringify(serviceIds));
            localStorage.setItem('cached_all_services_timestamp', now.toString());
          } catch (e) {
            console.error('Error caching services:', e);
          }
          
          // If we're not editing a stylist, pre-select all services
          if (!editStylist) {
            setSelectedServiceIds(serviceIds);
          }
        }
      } catch (err) {
        console.error('Failed to fetch services:', err);
      }
    };
    
    if (isOpen) {
      fetchAllServices();
    }
  }, [isOpen, editStylist, setSelectedServiceIds, allServices.length]);

  // Memoized function to fetch users for the dropdown
  const fetchUsers = useCallback(async () => {
    // Don't fetch if we already have users or are currently loading
    if (existingUsers.length > 0 || isLoading) {
      return;
    }
    
    try {
      setIsLoading(true);
      setUsersFetchError(null);
      console.log("Fetching users for stylist association...");
      
      // Use a static cache approach to reduce API calls
      const cachedUsers = localStorage.getItem('cached_profile_users');
      const cacheTimestamp = localStorage.getItem('cached_profile_users_timestamp');
      const now = Date.now();
      const cacheAge = cacheTimestamp ? now - parseInt(cacheTimestamp) : Infinity;
      
      // Use cache if it's less than 5 minutes old
      if (cachedUsers && cacheAge < 300000) {
        try {
          const users = JSON.parse(cachedUsers);
          console.log(`Using cached users data (${users.length} users)`);
          setExistingUsers(users);
          return;
        } catch (e) {
          console.error('Error parsing cached users:', e);
          // Continue with fetch if cache parse fails
        }
      }
      
      // Manual approach to avoid auth issues
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .order('full_name');
      
      if (error) {
        console.error('Error fetching users:', error);
        setUsersFetchError(error.message);
        return;
      }
      
      if (data) {
        console.log(`Fetched ${data.length} users for dropdown`);
        // Map the data to the expected format
        const formattedUsers = data.map(user => ({
          id: user.id,
          email: user.full_name || user.id // Use full_name as display value, fallback to id
        }));
        
        // Update state
        setExistingUsers(formattedUsers);
        
        // Cache the results
        try {
          localStorage.setItem('cached_profile_users', JSON.stringify(formattedUsers));
          localStorage.setItem('cached_profile_users_timestamp', now.toString());
        } catch (e) {
          console.error('Error caching users:', e);
        }
      }
    } catch (err) {
      console.error('Error in fetchUsers:', err);
      setUsersFetchError('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      console.log("StylistFormModal opened, fetching data");
      fetchUsers().catch(err => {
        console.error("Failed to fetch users:", err);
      });
      // If editing an existing stylist, load their services
      if (editStylist?.id) {
        console.log(`Loading services for existing stylist: ${editStylist.id}`);
        loadStylistServices(editStylist.id);
      } else {
        console.log("Adding new stylist, clearing selected services");
        setSelectedServiceIds([]);
      }
    }
  }, [isOpen, editStylist?.id, loadStylistServices, fetchUsers]);

  // Prevent multiple submissions
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle form submission
  const onSubmit = async (values: ExtendedStylistFormValues) => {
    // Prevent double submissions
    if (isSubmitting) {
      console.log("Form submission already in progress, ignoring duplicate submit");
      return null;
    }
    
    try {
      console.log("Form submitted with values:", values);
      setIsLoading(true);
      setIsSubmitting(true);
      
      let userId = values.user_id;
      
      // If this is a new stylist and email/password are provided, create user first
      if (!editStylist && values.email && values.password) {
        try {
          // Create the user in auth
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: values.email,
            password: values.password,
            options: {
              data: {
                full_name: values.name,
                role: 'stylist'
              }
            }
          });
          
          if (authError) {
            throw authError;
          }
          
          if (!authData.user) {
            throw new Error("Failed to create user account");
          }
          
          // Use the new user's ID
          userId = authData.user.id;
          console.log(`Created new user with ID: ${userId}`);
          
          // Wait a moment for auth system to create the profile
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Explicitly update the profile to ensure 'role' is set
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ 
              role: 'stylist',
              full_name: values.name,
              avatar_url: values.image,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);
          
          if (profileError) {
            console.error("Error updating profile:", profileError);
            toast.warning("User created but profile update failed");
          } else {
            console.log(`Updated profile for user ${userId} with role 'stylist'`);
          }
          
          toast.success("User account created successfully!");
          
        } catch (error: any) {
          console.error("Error creating user:", error);
          toast.error(error.message || "Failed to create user account");
          throw error;
        }
      }
      
      // Update the values with the new user ID if created
      const stylistData = { 
        ...values, 
        user_id: userId,
        // Ensure these critical fields are set
        name: values.name || "",
        role: "مصففة شعر", // Ensure role is set
        available: true, // Make sure they're available by default
        experience: values.experience || 1,
        rating: values.rating || 5.0,
        reviews: 0,
        specialties: values.specialties || [],
        bio: values.bio || "",
        image: values.image || "https://source.unsplash.com/random/300x300/?hairstylist"
      };
      
      delete stylistData.email;
      delete stylistData.password;
      
      console.log("Final stylist data being saved:", stylistData);
      
      // Save the stylist data
      const result = await onSave(stylistData);
      
      // If stylist was saved and we have an ID, update the services
      if (result && typeof result === 'object' && 'id' in result) {
        console.log(`Stylist saved with ID: ${result.id}, updating services...`);
        setSavedStylistId(result.id);
        
        // Always assign all services
        const servicesToAssign = allServices;
        
        // Update services for the new/updated stylist
        await updateStylistServices(result.id, servicesToAssign);
        
        // Force refresh the list (workaround for styling list not updating)
        try {
          await supabase.auth.refreshSession();
          
          // This ensures the stylist appears in lists
          await supabase
            .from('stylists')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', result.id);
            
          console.log("Refreshed stylist data to ensure visibility");
        } catch (refreshError) {
          console.error("Error refreshing stylist data:", refreshError);
        }
        
        console.log("Stylist and services saved successfully");
        toast.success(editStylist ? "Stylist updated successfully" : "New stylist added successfully");
        
        // Close the modal first to prevent re-rendering issues
        onClose();
        // Then reset the form
        form.reset();
        
        // Reload the page to ensure all lists are updated
        window.location.reload();
        
        return result;
      } else {
        console.error("Failed to save stylist - no ID returned:", result);
        toast.error("Failed to save stylist information");
      }
    } catch (error: any) {
      console.error("Form submission error:", error);
      toast.error(error.message || "Failed to save stylist");
      return null;
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
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
            <StylistBasicInfoFields form={form} />

            <StylistSpecialtiesField form={form} />

            <Separator className="my-4" />
            
            <div className="space-y-2">
              <FormLabel>Services</FormLabel>
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800 flex items-center">
                  <Check className="mr-2 h-5 w-5" /> 
                  All services will be automatically assigned to this stylist
                </p>
              </div>
            </div>

            <Separator className="my-4" />
            
            <StylistExperienceField form={form} />

            <StylistRatingField form={form} />

            <StylistAvailabilityField form={form} />

            {!editStylist && (
              <>
                <Separator className="my-4" />
                <div className="bg-slate-50 p-4 rounded-md border border-slate-200 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-salon-green">Stylist Account</h3>
                    <p className="text-sm text-gray-600">Create user credentials for this stylist to allow them to log in.</p>
                  </div>
                  
                  <div className="grid gap-4">
                    <div className="grid w-full items-center gap-1.5">
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <FormControl>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter stylist email"
                          {...form.register("email")}
                        />
                      </FormControl>
                      {form.formState.errors.email && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.email.message as string}
                        </p>
                      )}
                    </div>
                    
                    <div className="grid w-full items-center gap-1.5">
                      <FormLabel htmlFor="password">Password</FormLabel>
                      <FormControl>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter password"
                          {...form.register("password")}
                        />
                      </FormControl>
                      {form.formState.errors.password && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.password.message as string}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </>
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
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    {editStylist ? "Updating..." : "Adding..."}
                  </span>
                ) : (
                  editStylist ? "Update Stylist" : "Add Stylist"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default StylistFormModal;
