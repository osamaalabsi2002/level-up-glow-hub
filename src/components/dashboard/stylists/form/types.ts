
import { z } from "zod";

// Zod schema for form validation
export const stylistFormSchema = z.object({
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

export type StylistFormValues = z.infer<typeof stylistFormSchema>;
