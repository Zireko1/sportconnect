export type Sport =
  | "soccer_five"
  | "padel"
  | "basket"
  | "volley"
  | "futsal"
  | "badminton"
  | "velo"
  | "trail";

export type SportType = "collectif" | "outdoor";

export type Level = "debutant" | "intermediaire" | "confirme";

export type AnnonceStatus = "open" | "full" | "cancelled" | "completed";

export type InscriptionStatus = "pending" | "confirmed" | "cancelled";

export type AlertFrequency = "realtime" | "daily" | "weekly";

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url: string | null;
          sports: Sport[];
          level: Level | null;
          city: string | null;
          latitude: number | null;
          longitude: number | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string | null;
          sports?: Sport[];
          level?: Level | null;
          city?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string | null;
          sports?: Sport[];
          level?: Level | null;
          city?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      annonces: {
        Row: {
          id: string;
          organizer_id: string;
          sport: Sport;
          sport_type: SportType;
          title: string;
          description: string | null;
          date_time: string;
          location_name: string;
          latitude: number | null;
          longitude: number | null;
          city: string;
          total_spots: number;
          filled_spots: number;
          level: Level | null;
          price_per_player: number;
          distance_km: number | null;
          elevation_m: number | null;
          pace: string | null;
          status: AnnonceStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          organizer_id: string;
          sport: Sport;
          sport_type: SportType;
          title: string;
          description?: string | null;
          date_time: string;
          location_name: string;
          latitude?: number | null;
          longitude?: number | null;
          city: string;
          total_spots: number;
          filled_spots?: number;
          level?: Level | null;
          price_per_player?: number;
          distance_km?: number | null;
          elevation_m?: number | null;
          pace?: string | null;
          status?: AnnonceStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          organizer_id?: string;
          sport?: Sport;
          sport_type?: SportType;
          title?: string;
          description?: string | null;
          date_time?: string;
          location_name?: string;
          latitude?: number | null;
          longitude?: number | null;
          city?: string;
          total_spots?: number;
          filled_spots?: number;
          level?: Level | null;
          price_per_player?: number;
          distance_km?: number | null;
          elevation_m?: number | null;
          pace?: string | null;
          status?: AnnonceStatus;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "annonces_organizer_id_fkey";
            columns: ["organizer_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      inscriptions: {
        Row: {
          id: string;
          annonce_id: string;
          user_id: string;
          status: InscriptionStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          annonce_id: string;
          user_id: string;
          status?: InscriptionStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          annonce_id?: string;
          user_id?: string;
          status?: InscriptionStatus;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inscriptions_annonce_id_fkey";
            columns: ["annonce_id"];
            referencedRelation: "annonces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inscriptions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      alert_configs: {
        Row: {
          id: string;
          user_id: string;
          sports: Sport[];
          radius_km: number;
          days_of_week: number[];
          time_slots: string[];
          level: Level | "tous";
          frequency: AlertFrequency;
          active: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          sports?: Sport[];
          radius_km?: number;
          days_of_week?: number[];
          time_slots?: string[];
          level?: Level | "tous";
          frequency?: AlertFrequency;
          active?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          sports?: Sport[];
          radius_km?: number;
          days_of_week?: number[];
          time_slots?: string[];
          level?: Level | "tous";
          frequency?: AlertFrequency;
          active?: boolean;
        };
        Relationships: [];
      };
      alert_queue: {
        Row: {
          id: string;
          user_id: string;
          annonce_id: string;
          sent_at: string | null;
          scheduled_for: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          annonce_id: string;
          sent_at?: string | null;
          scheduled_for: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          annonce_id?: string;
          sent_at?: string | null;
          scheduled_for?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
