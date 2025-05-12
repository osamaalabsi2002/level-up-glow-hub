
export interface Booking {
  id: number;
  clientName: string;
  stylistName: string;
  date: string;
  time: string;
  service: string;
  status: "confirmed" | "pending" | "completed" | "canceled";
  clientEmail?: string;
  clientPhone?: string;
  stylistId?: number;
  serviceId?: number;
  clientId?: string;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
}

export interface Stylist {
  id: number;
  name: string;
  role: string;
  rating: number;
  reviews: number;
  specialties: string[];
  image: string;
  bio?: string;
  available?: boolean;
  experience?: number;
  services?: { name: string; price: number }[];
  clientReviews?: { id: number; name: string; rating: number; date: string; text: string }[];
  userId?: string;
}

export interface User {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  role: string;
  phone?: string;
}
