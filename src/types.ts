export interface Movie {
  id: string; // UUID or string id
  title: string;
  original_title?: string;
  genre: string;
  year: number;
  duration: number; // minutes
  director: string;
  rating: number; // 0-5 stars
  synopsis: string;
  image_url: string;
  price_per_day: number;
  available_copies: number;
  is_retro_classic: boolean;
  vhs_box_color?: string; // Hex color for the vintage plastic border decoration
  banner_url?: string;
}

export interface Rental {
  id: string;
  movie_id: string;
  movie_title: string;
  movie_image: string;
  rent_date: string; // ISO string
  due_date: string; // ISO string
  returned_at?: string | null;
  status: 'active' | 'returned';
  total_paid: number;
  renter_name: string;
  renter_phone?: string;
}
