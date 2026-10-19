export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus =
  | "pending"
  | "authorized"
  | "paid"
  | "refunded"
  | "failed";

export type PaymentProvider = "manual" | "cod" | "stripe" | "test";

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          parent_id: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          parent_id?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          parent_id?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      brands: {
        Row: {
          id: string;
          name: string;
          slug: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          sku: string;
          name: string;
          slug: string;
          short_description: string | null;
          description: string | null;
          brand_id: string | null;
          category_id: string;
          price: number;
          compare_at_price: number | null;
          currency: string;
          stock_quantity: number;
          is_published: boolean;
          weight: number | null;
          dimensions: string | null;
          created_at: string;
          updated_at: string;
          archived_at: string | null;
        };
        Insert: {
          id?: string;
          sku: string;
          name: string;
          slug: string;
          short_description?: string | null;
          description?: string | null;
          brand_id?: string | null;
          category_id: string;
          price: number;
          compare_at_price?: number | null;
          currency?: string;
          stock_quantity?: number;
          is_published?: boolean;
          weight?: number | null;
          dimensions?: string | null;
          created_at?: string;
          updated_at?: string;
          archived_at?: string | null;
        };
        Update: {
          id?: string;
          sku?: string;
          name?: string;
          slug?: string;
          short_description?: string | null;
          description?: string | null;
          brand_id?: string | null;
          category_id?: string;
          price?: number;
          compare_at_price?: number | null;
          currency?: string;
          stock_quantity?: number;
          is_published?: boolean;
          weight?: number | null;
          dimensions?: string | null;
          created_at?: string;
          updated_at?: string;
          archived_at?: string | null;
        };
        Relationships: [];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          storage_path: string;
          alt_text: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          storage_path: string;
          alt_text?: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          storage_path?: string;
          alt_text?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      vehicles: {
        Row: {
          id: string;
          make: string;
          model: string;
          year_start: number;
          year_end: number;
          engine_specs: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          make: string;
          model: string;
          year_start: number;
          year_end: number;
          engine_specs?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          make?: string;
          model?: string;
          year_start?: number;
          year_end?: number;
          engine_specs?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      product_fitments: {
        Row: {
          id: string;
          product_id: string;
          vehicle_id: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          vehicle_id: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          vehicle_id?: string;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string | null;
          status: OrderStatus;
          currency: string;
          subtotal: number;
          shipping_amount: number;
          tax_amount: number;
          discount_amount: number;
          total: number;
          customer_email: string;
          customer_name: string;
          customer_phone: string | null;
          shipping_address: Json;
          payment_provider: PaymentProvider;
          payment_status: PaymentStatus;
          payment_reference: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          user_id?: string | null;
          status?: OrderStatus;
          currency?: string;
          subtotal: number;
          shipping_amount?: number;
          tax_amount?: number;
          discount_amount?: number;
          total: number;
          customer_email: string;
          customer_name: string;
          customer_phone?: string | null;
          shipping_address: Json;
          payment_provider?: PaymentProvider;
          payment_status?: PaymentStatus;
          payment_reference?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          user_id?: string | null;
          status?: OrderStatus;
          currency?: string;
          subtotal?: number;
          shipping_amount?: number;
          tax_amount?: number;
          discount_amount?: number;
          total?: number;
          customer_email?: string;
          customer_name?: string;
          customer_phone?: string | null;
          shipping_address?: Json;
          payment_provider?: PaymentProvider;
          payment_status?: PaymentStatus;
          payment_reference?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          sku_snapshot: string;
          product_name_snapshot: string;
          unit_price: number;
          quantity: number;
          line_total: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          sku_snapshot: string;
          product_name_snapshot: string;
          unit_price: number;
          quantity: number;
          line_total: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          sku_snapshot?: string;
          product_name_snapshot?: string;
          unit_price?: number;
          quantity?: number;
          line_total?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      admin_users: {
        Row: {
          id: string;
          role: "admin" | "super_admin" | "editor";
          created_at: string;
        };
        Insert: {
          id: string;
          role?: "admin" | "super_admin" | "editor";
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: "admin" | "super_admin" | "editor";
          created_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          details: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          details?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          details?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      create_checkout_order: {
        Args: {
          p_order: Json;
          p_items: Json;
        };
        Returns: undefined;
      };
      admin_update_order_status: {
        Args: {
          p_order_id: string;
          p_expected_status: string;
          p_new_status: string;
        };
        Returns: string;
      };
    };
  };
}

// Convenient Row type aliases
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Brand = Database["public"]["Tables"]["brands"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductImage = Database["public"]["Tables"]["product_images"]["Row"];
export type Vehicle = Database["public"]["Tables"]["vehicles"]["Row"];
export type ProductFitment = Database["public"]["Tables"]["product_fitments"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type AdminUser = Database["public"]["Tables"]["admin_users"]["Row"];
export type AuditLog = Database["public"]["Tables"]["audit_logs"]["Row"];
