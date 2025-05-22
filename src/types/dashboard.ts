
export interface Booking {
  id: number;
  date: string;
  time: string;
  status: string;
  duration?: number;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  stylistName: string;
  service: string;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  phone: string | null;
}

export interface Stylist {
  id: number;
  name: string;
  role: string;
  bio: string | null;
  image: string;
  available: boolean;
  rating: number;
  reviews: number;
  experience: number;
  specialties: string[];
  services?: string[];
  clientReviews?: Array<{ id: number, rating: number, comment: string }>;
  user_id?: string | null;
}

export interface Service {
  id: number;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  image_url?: string;
}

export interface DashboardTabProps {
  loading: boolean;
}

export interface BlogPost {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  image_url?: string;
  published: boolean;
  slug: string;
  author_name?: string;
  category?: string;
  created_at: string;
}
