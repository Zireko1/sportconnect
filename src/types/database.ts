export type Sport =
  | "soccer_five"
  | "padel"
  | "basket"
  | "volley"
  | "futsal"
  | "badminton"
  | "velo"
  | "trail"
  | "randonnee"
  | "autre";

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
          sport_custom: string | null;
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
          sport_custom?: string | null;
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
          sport_custom?: string | null;
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
          },
          {
            foreignKeyName: "annonces_organizer_id_fkey";
            columns: ["organizer_id"];
            referencedRelation: "public_profiles";
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
        Relationships: [
          {
            foreignKeyName: "alert_queue_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "alert_queue_annonce_id_fkey";
            columns: ["annonce_id"];
            referencedRelation: "annonces";
            referencedColumns: ["id"];
          }
        ];
      };
      messages: {
        Row: {
          id: string;
          annonce_id: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          annonce_id: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          annonce_id?: string;
          sender_id?: string;
          receiver_id?: string;
          content?: string;
          read?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_annonce_id_fkey";
            columns: ["annonce_id"];
            referencedRelation: "annonces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_receiver_id_fkey";
            columns: ["receiver_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      avis_annonces: {
        Row: {
          id: string;
          reviewer_id: string;
          annonce_id: string;
          note: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          reviewer_id: string;
          annonce_id: string;
          note: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          reviewer_id?: string;
          annonce_id?: string;
          note?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      avis_joueurs: {
        Row: {
          id: string;
          reviewer_id: string;
          reviewed_id: string;
          annonce_id: string;
          note: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          reviewer_id: string;
          reviewed_id: string;
          annonce_id: string;
          note: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          reviewer_id?: string;
          reviewed_id?: string;
          annonce_id?: string;
          note?: number;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      /** Profils publics (ni email ni coordonnées) — cf. migration public_profiles */
      public_profiles: {
        Row: {
          id: string;
          first_name: string;
          avatar_url: string | null;
          sports: Sport[];
          level: Level | null;
          city: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      nearby_profiles: {
        Args: { p_lat: number; p_lon: number; p_radius_km?: number; p_limit?: number };
        Returns: {
          id: string;
          first_name: string;
          avatar_url: string | null;
          sports: Sport[];
          level: Level | null;
          city: string | null;
          distance_km: number;
        }[];
      };
      count_profiles_near: {
        Args: { p_lat: number; p_lon: number; p_radius_km: number; p_city: string | null; p_sports: Sport[] };
        Returns: number;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
