
export interface Booking {
  id: number;
  clientName: string;
  stylistName: string;
  date: string;
  time: string;
  service: string;
  status: "pending" | "confirmed" | "canceled" | "completed";
}

export interface Service {
  id: number;
  name: string;
  description?: string;
  duration: number;
  price: number;
  image_url?: string;
}

export interface Stylist {
  id: number;
  name: string;
  role: string;
  image: string;
  bio: string;
  available: boolean;
  rating: number;
  reviews: number;
  specialties: string[];
  experience: number;
  services: Service[];
  clientReviews: any[];
  user_id?: string; // Link to the auth.users table
}

export interface StatsData {
  bookingsCount: number;
  todayBookingsCount: number;
  stylistsCount: number;
  averageRating: number;
}

export interface Review {
  id: number;
  clientName: string;
  rating: number;
  comment: string;
  date: string;
  isVerified: boolean;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
}
