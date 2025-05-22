
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, User } from "lucide-react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { UserProfile } from "@/types/dashboard";

interface UserInfoFieldsProps {
  form: UseFormReturn<any>;
  user: any | null;
  profile: UserProfile | null;
}

const UserInfoFields = ({ form, user, profile }: UserInfoFieldsProps) => {
  return (
    <>
      {user ? (
        <Alert className="bg-blue-50 text-blue-800 border border-blue-200">
          <AlertDescription className="flex items-start">
            <div className="mr-2 mt-0.5">
              <User className="h-4 w-4" />
            </div>
            <span>
              Booking as <strong>{profile?.full_name || user.email}</strong>
            </span>
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="your.email@example.com" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input 
                    type="tel" 
                    placeholder="(123) 456-7890" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </>
  );
};

export default UserInfoFields;
