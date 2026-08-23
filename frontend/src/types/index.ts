export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  profile_photo_url?: string;
  language_pref?: string;
  preferred_currency?: string;
  created_at?: string;
  saved_destinations?: Array<{ id: number; city: City }>;
}

export interface City {
  id: number;
  name: string;
  country: string;
  region: string;
  cost_index: number;
  popularity_score: number;
  image_url: string;
  _count?: {
    activities: number;
  };
}

export interface Activity {
  id: number;
  city_id: number;
  name: string;
  category: string;
  description: string;
  image_url: string;
  estimated_cost: number | string;
  estimated_duration_mins: number;
  city?: City;
}

export interface TripActivity {
  id: number;
  stop_id: number;
  activity_id: number;
  scheduled_date: string | null;
  scheduled_time: string | null;
  cost_override: number | string | null;
  activity: Activity;
}

export interface Stop {
  id: number;
  trip_id: number;
  city_id: number;
  arrival_date: string;
  departure_date: string;
  order_index: number;
  city: City;
  trip_activities: TripActivity[];
}

export interface BudgetEntry {
  id: number;
  trip_id: number;
  category: string;
  amount: number | string;
  note: string | null;
}

export interface Trip {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  cover_photo_url: string | null;
  start_date: string;
  end_date: string;
  target_budget: number | string | null;
  display_currency?: string;
  base_currency?: string;
  is_public: boolean;
  public_slug: string | null;
  created_at: string;
  stops: Stop[];
  budget_entries?: BudgetEntry[];
  _count?: {
    stops: number;
  };
  user?: {
    name: string;
    profile_photo_url?: string;
  };
}

export interface BudgetBreakdown {
  currency?: string;
  base_currency?: string;
  totalCost: number;
  breakdown: {
    transport: number;
    stay: number;
    activities: number;
    meals: number;
    other: number;
  };
  days: number;
  avgCostPerDay: number;
  targetBudget: number | null;
  isOverBudget: boolean;
  lineItems: Array<{
    id: string;
    type: string;
    name: string;
    category: string;
    amount: number;
    date?: string | null;
    rawId: number;
  }>;
}

export interface AdminStats {
  totalUsers: number;
  totalTrips: number;
  activeUsers: number;
  tripsOverTime: Array<{ period: string; trips: number }>;
  topCities: Array<{ id: number; name: string; country: string; count: number }>;
  topActivities: Array<{ id: number; name: string; city: string; category: string; count: number }>;
}