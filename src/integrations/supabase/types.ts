export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          address: string | null
          created_at: string
          date_of_birth: string | null
          full_name: string | null
          id: string
          is_vendor: boolean | null
          mobile_number: string | null
          notification_preferences: Json | null
          preferred_language: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string | null
          id: string
          is_vendor?: boolean | null
          mobile_number?: string | null
          notification_preferences?: Json | null
          preferred_language?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string | null
          id?: string
          is_vendor?: boolean | null
          mobile_number?: string | null
          notification_preferences?: Json | null
          preferred_language?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rewards: {
        Row: {
          created_at: string
          crypto_amount_in_pence: number | null
          customer_id: string
          expired_at: string | null
          id: string
          redeemed_at: string | null
          selected_platform: string | null
          stamps_used: number
          status: Database["public"]["Enums"]["reward_status"]
          type: Database["public"]["Enums"]["reward_type"]
          vendor_id: string
        }
        Insert: {
          created_at?: string
          crypto_amount_in_pence?: number | null
          customer_id: string
          expired_at?: string | null
          id?: string
          redeemed_at?: string | null
          selected_platform?: string | null
          stamps_used: number
          status?: Database["public"]["Enums"]["reward_status"]
          type: Database["public"]["Enums"]["reward_type"]
          vendor_id: string
        }
        Update: {
          created_at?: string
          crypto_amount_in_pence?: number | null
          customer_id?: string
          expired_at?: string | null
          id?: string
          redeemed_at?: string | null
          selected_platform?: string | null
          stamps_used?: number
          status?: Database["public"]["Enums"]["reward_status"]
          type?: Database["public"]["Enums"]["reward_type"]
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rewards_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      stamps: {
        Row: {
          collected_at: string
          id: string
          user_id: string | null
          vendor_id: string | null
        }
        Insert: {
          collected_at?: string
          id?: string
          user_id?: string | null
          vendor_id?: string | null
        }
        Update: {
          collected_at?: string
          id?: string
          user_id?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stamps_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_packages: {
        Row: {
          created_at: string
          duration_months: number
          id: string
          name: string
          price_in_pence: number
          tier: Database["public"]["Enums"]["subscription_tier"]
          transaction_fee_percentage: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_months: number
          id?: string
          name: string
          price_in_pence: number
          tier: Database["public"]["Enums"]["subscription_tier"]
          transaction_fee_percentage: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_months?: number
          id?: string
          name?: string
          price_in_pence?: number
          tier?: Database["public"]["Enums"]["subscription_tier"]
          transaction_fee_percentage?: number
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount_in_pence: number
          created_at: string
          customer_id: string
          fee_amount_in_pence: number
          fee_percentage: number
          id: string
          stamps_earned: number
          vendor_id: string
        }
        Insert: {
          amount_in_pence: number
          created_at?: string
          customer_id: string
          fee_amount_in_pence: number
          fee_percentage: number
          id?: string
          stamps_earned?: number
          vendor_id: string
        }
        Update: {
          amount_in_pence?: number
          created_at?: string
          customer_id?: string
          fee_amount_in_pence?: number
          fee_percentage?: number
          id?: string
          stamps_earned?: number
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_subscriptions: {
        Row: {
          created_at: string
          end_date: string
          id: string
          package_id: string
          start_date: string
          status: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          package_id: string
          start_date?: string
          status?: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          package_id?: string
          start_date?: string
          status?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_subscriptions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "subscription_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_subscriptions_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          address: string | null
          approved: boolean
          business_name: string
          created_at: string
          id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          approved?: boolean
          business_name: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          approved?: boolean
          business_name?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      reward_status: "earned" | "redeemed" | "expired"
      reward_type: "coffee" | "crypto" | "both" | "platform_shares"
      subscription_tier: "free_trial" | "monthly" | "biannual" | "annual"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
