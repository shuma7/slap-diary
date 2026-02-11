/**
 * Supabase Database の型定義
 * supabase.ts で使用する Database 型
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      diaries: {
        Row: {
          id: number;
          created_at: string;
          date: string;
          content: string;
          mood: number | null;
          condition: number | null;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          date?: string;
          content: string;
          mood?: number | null;
          condition?: number | null;
          updated_at?: string | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          date?: string;
          content?: string;
          mood?: number | null;
          condition?: number | null;
          updated_at?: string | null;
        };
        Relationships: []
      };
    };
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
