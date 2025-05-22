
import { z } from "zod";

export const bookingFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
  date: z.string().min(1, { message: "Please select a date" }),
  time: z.string().min(1, { message: "Please select a time" }),
  services: z.array(z.string()).min(1, { message: "Please select at least one service" }),
  stylist: z.string().min(1, { message: "Please select a stylist" }),
  stylistId: z.number({ required_error: "Stylist is required" }),
  duration: z.number().optional(),
  notes: z.string().optional(),
});

export interface Service {
  id: string;
  label: string;
}

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
