import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { User, LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const loginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const registerFormSchema = loginFormSchema
  .extend({
    full_name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    confirmPassword: z
      .string()
      .min(6, { message: "Confirm password must be at least 6 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type LoginFormValues = z.infer<typeof loginFormSchema>;
type RegisterFormValues = z.infer<typeof registerFormSchema>;

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");
  const { profile, profileLoading } = useAuth();

  // Effect to close modal when user is authenticated
  useEffect(() => {
    if (profile && !profileLoading) {
      onClose();
      console.log("User authenticated, closing modal", profile.role);
      
      // Let the auth context handle the redirection
      setTimeout(() => {
        if (profile.role === "admin") {
          window.location.href = "/admin-dashboard";
        } else if (profile.role === "stylist") {
          window.location.href = "/stylist-dashboard";
        }
      }, 100); // Small delay to ensure context is fully updated
    }
  }, [profile, profileLoading, onClose]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { full_name: "", email: "", password: "", confirmPassword: "" },
  });

  const cleanupAuthState = () => {
    localStorage.removeItem('supabase.auth.token');
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  const handleLoginSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setLoginError("");
    try {
      // Clear previous auth state to avoid conflicts
      cleanupAuthState();
      
      // Sign out first to clear any existing session
      try {
        await supabase.auth.signOut({ scope: "global" });
      } catch (err) {
        // Ignore errors here
      }

      console.log("Attempting login with:", data.email);
      
      // Attempt login
      const { data: authData, error: signinError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      
      if (signinError) {
        console.error("Login error:", signinError);
        // More descriptive error message based on error type
        if (signinError.message.includes("Email not confirmed")) {
          setLoginError("Please verify your email before logging in");
        } else if (signinError.message.includes("Invalid login credentials")) {
          setLoginError("Invalid email or password");
        } else {
          setLoginError(signinError.message || "Login failed");
        }
        setIsLoading(false);
        return;
      }

      console.log("Login successful", authData);
      
      // Success notification
      toast.success("Login successful!");
      
      // Reset form
      loginForm.reset();
      
      // Do NOT navigate here - let the AuthContext effect handle it
      // The useEffect will detect the profile change and redirect
    } catch (err) {
      console.error(err);
      setLoginError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setRegisterError("");
    try {
      cleanupAuthState();
      
      // Sign out first
      try {
        await supabase.auth.signOut({ scope: "global" });
      } catch (err) {
        // Ignore errors here
      }

      // Attempt registration
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { 
          data: { 
            full_name: data.full_name,
            role: "customer"
          } 
        },
      });
      
      if (error) {
        console.error("Registration error:", error);
        setRegisterError(error.message || "Failed to register. Please try again.");
        setIsLoading(false);
        return;
      }

      toast.success("Registration successful! Welcome to Level Up Beauty Salon!");
      onClose();
      registerForm.reset();
      setMode("login");
      
    } catch (err: unknown) {
      console.error("Registration error:", err);
      if (err instanceof Error) {
        setRegisterError(err.message || "Failed to register. Please try again.");
      } else {
        setRegisterError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-salon-green text-xl">
            {mode === "login" ? "Login to Your Account" : "Create an Account"}
          </DialogTitle>
          <DialogDescription>
            {mode === "login"
              ? "Enter your credentials to access your account."
              : "Join us to book appointments and enjoy member benefits."}
          </DialogDescription>
        </DialogHeader>

        {mode === "login" ? (
          <Form {...loginForm}>
            <form
              onSubmit={loginForm.handleSubmit(handleLoginSubmit)}
              className="space-y-4 pt-4"
            >
              {loginError && <p className="text-red-500">{loginError}</p>}
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your.email@example.com"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between items-center pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-salon-green hover:text-gold p-0"
                  onClick={() => setMode("register")}
                  disabled={isLoading}
                >
                  Need an account?
                </Button>
                <Button
                  type="submit"
                  className="bg-salon-green hover:bg-salon-darkGreen text-white"
                  disabled={isLoading}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <Form {...registerForm}>
            <form
              onSubmit={registerForm.handleSubmit(handleRegisterSubmit)}
              className="space-y-4 pt-4"
            >
              {registerError && <p className="text-red-500">{registerError}</p>}
              <FormField
                control={registerForm.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your.email@example.com"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Create a password"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm your password"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between items-center pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-salon-green hover:text-gold p-0"
                  onClick={() => setMode("login")}
                  disabled={isLoading}
                >
                  Already have an account?
                </Button>
                <Button
                  type="submit"
                  className="bg-salon-green hover:bg-salon-darkGreen text-white"
                  disabled={isLoading}
                >
                  <User className="mr-2 h-4 w-4" />
                  {isLoading ? "Registering..." : "Register"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
