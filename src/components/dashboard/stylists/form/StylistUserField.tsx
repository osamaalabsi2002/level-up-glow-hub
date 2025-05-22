import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { StylistFormValues } from "./types";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertCircle, RefreshCw, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

interface StylistUserFieldProps {
  form: UseFormReturn<StylistFormValues>;
  existingUsers: Array<{ id: string; email: string }>;
}

const StylistUserField = ({ form, existingUsers }: StylistUserFieldProps) => {
  const [loading, setLoading] = useState(false);
  const [userOptions, setUserOptions] = useState<Array<{ id: string; email: string }>>(existingUsers || []);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [offlineMode, setOfflineMode] = useState(false);
  const [createNewUser, setCreateNewUser] = useState(true);

  // Form schema for creating a new user
  const newUserSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    full_name: z.string().min(1, "Please enter a name")
  });

  // Form for creating a new user
  const newUserForm = useForm({
    resolver: zodResolver(newUserSchema),
    defaultValues: {
      email: "",
      password: "",
      full_name: ""
    }
  });

  // More robust fetch function with better error handling
  const fetchAvailableUsers = useCallback(async () => {
    if (offlineMode) {
      // Use existing users if we're in offline mode
      setUserOptions(existingUsers);
      return;
    }

    try {
      setLoading(true);
      setFetchError(null);
      console.log("StylistUserField: Fetching available users...");
      
      // Add a timeout to the fetch operation
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), 8000);
      });
      
      // Create the actual fetch promise
      const fetchPromise = supabase
        .from('profiles')
        .select('id, full_name')
        .or('role.is.null,role.neq.stylist')
        .order('full_name');
      
      // Race the timeout against the actual fetch
      const { data, error } = await Promise.race([
        fetchPromise,
        timeoutPromise.then(() => { throw new Error('Request timed out'); })
      ]) as any;
      
      if (error) {
        console.error('Error fetching available users:', error);
        setFetchError('Failed to load users: ' + error.message);
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log(`StylistUserField: Found ${data.length} available users`);
        
        // Format users for the dropdown
        const formattedUsers = data.map(user => ({
          id: user.id,
          email: user.full_name || user.id
        }));
        
        setUserOptions(formattedUsers);
        setOfflineMode(false);
      } else {
        console.log('StylistUserField: No available users found');
        setUserOptions([]);
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      
      // Set a more user-friendly error message
      if (err.message?.includes('Failed to fetch') || err.message?.includes('timed out')) {
        setFetchError('Network connection error. Check your internet connection.');
        // If we have existing users, use them as a fallback
        if (existingUsers && existingUsers.length > 0) {
          setUserOptions(existingUsers);
          setOfflineMode(true);
          toast.warning('Using cached user data due to connection issues');
        } else {
          toast.error('Could not load users. Network connection error');
        }
      } else {
        setFetchError(err.message || 'Unknown error loading users');
        toast.error('Failed to load available users');
      }
    } finally {
      setLoading(false);
    }
  }, [existingUsers, offlineMode]);

  // Fetch users when component mounts or when retry is triggered
  useEffect(() => {
    if (existingUsers.length === 0 || retryCount > 0) {
      fetchAvailableUsers();
    } else {
      setUserOptions(existingUsers);
    }
  }, [existingUsers, retryCount, fetchAvailableUsers]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setOfflineMode(false);
  };

  // Handle the creation of a new user
  const handleCreateUser = async (userData: z.infer<typeof newUserSchema>) => {
    try {
      setLoading(true);
      
      // Create the user in auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name,
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
      
      // Set the new user ID in the stylist form
      form.setValue("user_id", authData.user.id, { shouldValidate: true });
      
      // Fetch all services to assign to this stylist
      const { data: services } = await supabase
        .from('services')
        .select('id');
        
      // Log the success
      console.log(`Created new stylist user and will assign all services: ${services?.length || 0} services found`);
      
      toast.success("User account created successfully!");
      setCreateNewUser(false);
      
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error(error.message || "Failed to create user account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormField
      control={form.control}
      name="user_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-2">
            Associate with User (Optional)
            {loading && (
              <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
            )}
          </FormLabel>
          <FormControl>
            <div className="space-y-4">
              <FormLabel>User Account</FormLabel>
              <div className="flex flex-col gap-4 mt-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">Stylist Login Credentials</h4>
                    <p className="text-xs text-gray-500">
                      {createNewUser 
                        ? "Create login credentials for this stylist" 
                        : "Select an existing user or create new credentials"}
                    </p>
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCreateNewUser(!createNewUser)}
                  >
                    {createNewUser ? "Select Existing User" : "Create New User"}
                  </Button>
                </div>
                
                {!createNewUser ? (
                  <Select
                    disabled={loading}
                    value={form.watch("user_id") || "none"}
                    onValueChange={(value) => form.setValue("user_id", value, { shouldValidate: true })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="none">None (No user account)</SelectItem>
                        {userOptions && userOptions.length > 0 ? (
                          userOptions.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.email}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-users" disabled>
                            {loading ? "Loading users..." : "No available users found"}
                          </SelectItem>
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-4 border rounded-md bg-slate-50">
                    <form onSubmit={newUserForm.handleSubmit(handleCreateUser)} className="space-y-3">
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter full name"
                            {...newUserForm.register("full_name")}
                          />
                        </FormControl>
                        {newUserForm.formState.errors.full_name && (
                          <p className="text-sm text-red-500">
                            {newUserForm.formState.errors.full_name.message}
                          </p>
                        )}
                      </FormItem>
                      
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter email address"
                            {...newUserForm.register("email")}
                          />
                        </FormControl>
                        {newUserForm.formState.errors.email && (
                          <p className="text-sm text-red-500">
                            {newUserForm.formState.errors.email.message}
                          </p>
                        )}
                      </FormItem>
                      
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter password"
                            {...newUserForm.register("password")}
                          />
                        </FormControl>
                        {newUserForm.formState.errors.password && (
                          <p className="text-sm text-red-500">
                            {newUserForm.formState.errors.password.message}
                          </p>
                        )}
                      </FormItem>
                      
                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCreateNewUser(false);
                            form.setValue("user_id", "none");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          className="bg-salon-green hover:bg-salon-darkGreen text-white"
                          disabled={loading}
                        >
                          {loading ? (
                            <span className="flex items-center gap-1">
                              <RefreshCw className="h-3 w-3 animate-spin" />
                              Creating...
                            </span>
                          ) : (
                            "Create User"
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default StylistUserField;
