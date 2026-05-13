export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ad_campaigns: {
        Row: {
          budget: number | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          created_at: string
          created_by: string | null
          daily_impression_limit: number | null
          end_date: string | null
          id: string
          name: string
          notes: string | null
          share_token: string | null
          start_date: string | null
          status: string
          total_impression_limit: number | null
          updated_at: string
        }
        Insert: {
          budget?: number | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string
          created_by?: string | null
          daily_impression_limit?: number | null
          end_date?: string | null
          id?: string
          name: string
          notes?: string | null
          share_token?: string | null
          start_date?: string | null
          status?: string
          total_impression_limit?: number | null
          updated_at?: string
        }
        Update: {
          budget?: number | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string
          created_by?: string | null
          daily_impression_limit?: number | null
          end_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          share_token?: string | null
          start_date?: string | null
          status?: string
          total_impression_limit?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_creatives: {
        Row: {
          background_color: string | null
          campaign_id: string
          created_at: string
          cta_text: string | null
          device_type: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          mobile_image_url: string | null
          name: string
          size: string
          subtitle: string | null
          tablet_image_url: string | null
          target_url: string
          title: string | null
        }
        Insert: {
          background_color?: string | null
          campaign_id: string
          created_at?: string
          cta_text?: string | null
          device_type?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          mobile_image_url?: string | null
          name: string
          size: string
          subtitle?: string | null
          tablet_image_url?: string | null
          target_url: string
          title?: string | null
        }
        Update: {
          background_color?: string | null
          campaign_id?: string
          created_at?: string
          cta_text?: string | null
          device_type?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          mobile_image_url?: string | null
          name?: string
          size?: string
          subtitle?: string | null
          tablet_image_url?: string | null
          target_url?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_creatives_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ad_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_impressions: {
        Row: {
          created_at: string
          creative_id: string
          id: string
          impression_type: string
          ip_hash: string | null
          page_url: string | null
          slot_name: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          creative_id: string
          id?: string
          impression_type: string
          ip_hash?: string | null
          page_url?: string | null
          slot_name?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          creative_id?: string
          id?: string
          impression_type?: string
          ip_hash?: string | null
          page_url?: string | null
          slot_name?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      ad_placements: {
        Row: {
          article_id: string | null
          created_at: string
          creative_id: string
          days_of_week: number[] | null
          end_time: string | null
          id: string
          is_active: boolean | null
          priority: number | null
          section: string | null
          slot_name: string
          start_time: string | null
        }
        Insert: {
          article_id?: string | null
          created_at?: string
          creative_id: string
          days_of_week?: number[] | null
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          section?: string | null
          slot_name: string
          start_time?: string | null
        }
        Update: {
          article_id?: string | null
          created_at?: string
          creative_id?: string
          days_of_week?: number[] | null
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          section?: string | null
          slot_name?: string
          start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_placements_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "ad_creatives"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_requests: {
        Row: {
          ad_size: string
          ad_type: string
          admin_notes: string | null
          budget_range: string | null
          business_name: string | null
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at: string
          duration: string
          id: string
          image_url: string | null
          notes: string | null
          status: string
          target_url: string | null
          updated_at: string
        }
        Insert: {
          ad_size: string
          ad_type: string
          admin_notes?: string | null
          budget_range?: string | null
          business_name?: string | null
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at?: string
          duration: string
          id?: string
          image_url?: string | null
          notes?: string | null
          status?: string
          target_url?: string | null
          updated_at?: string
        }
        Update: {
          ad_size?: string
          ad_type?: string
          admin_notes?: string | null
          budget_range?: string | null
          business_name?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          created_at?: string
          duration?: string
          id?: string
          image_url?: string | null
          notes?: string | null
          status?: string
          target_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ad_stats: {
        Row: {
          clicks: number | null
          created_at: string
          creative_id: string
          date: string
          dismisses: number
          id: string
          impressions: number | null
        }
        Insert: {
          clicks?: number | null
          created_at?: string
          creative_id: string
          date?: string
          dismisses?: number
          id?: string
          impressions?: number | null
        }
        Update: {
          clicks?: number | null
          created_at?: string
          creative_id?: string
          date?: string
          dismisses?: number
          id?: string
          impressions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_stats_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "ad_creatives"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_content_stats: {
        Row: {
          avg_scroll_depth: number | null
          avg_time_seconds: number | null
          content_id: string
          content_title: string | null
          content_type: string
          date: string
          id: string
          shares: number | null
          unique_visitors: number | null
          views: number | null
        }
        Insert: {
          avg_scroll_depth?: number | null
          avg_time_seconds?: number | null
          content_id: string
          content_title?: string | null
          content_type: string
          date?: string
          id?: string
          shares?: number | null
          unique_visitors?: number | null
          views?: number | null
        }
        Update: {
          avg_scroll_depth?: number | null
          avg_time_seconds?: number | null
          content_id?: string
          content_title?: string | null
          content_type?: string
          date?: string
          id?: string
          shares?: number | null
          unique_visitors?: number | null
          views?: number | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          element_class: string | null
          element_id: string | null
          element_text: string | null
          event_action: string | null
          event_category: string | null
          event_label: string | null
          event_type: string
          event_value: number | null
          id: string
          metadata: Json | null
          page_url: string | null
          session_id: string
        }
        Insert: {
          created_at?: string
          element_class?: string | null
          element_id?: string | null
          element_text?: string | null
          event_action?: string | null
          event_category?: string | null
          event_label?: string | null
          event_type: string
          event_value?: number | null
          id?: string
          metadata?: Json | null
          page_url?: string | null
          session_id: string
        }
        Update: {
          created_at?: string
          element_class?: string | null
          element_id?: string | null
          element_text?: string | null
          event_action?: string | null
          event_category?: string | null
          event_label?: string | null
          event_type?: string
          event_value?: number | null
          id?: string
          metadata?: Json | null
          page_url?: string | null
          session_id?: string
        }
        Relationships: []
      }
      analytics_pageviews: {
        Row: {
          content_id: string | null
          content_type: string | null
          entered_at: string
          exited_at: string | null
          id: string
          is_bounce: boolean | null
          page_path: string
          page_title: string | null
          page_type: string | null
          page_url: string
          scroll_depth_percent: number | null
          session_id: string
          time_on_page_seconds: number | null
        }
        Insert: {
          content_id?: string | null
          content_type?: string | null
          entered_at?: string
          exited_at?: string | null
          id?: string
          is_bounce?: boolean | null
          page_path: string
          page_title?: string | null
          page_type?: string | null
          page_url: string
          scroll_depth_percent?: number | null
          session_id: string
          time_on_page_seconds?: number | null
        }
        Update: {
          content_id?: string | null
          content_type?: string | null
          entered_at?: string
          exited_at?: string | null
          id?: string
          is_bounce?: boolean | null
          page_path?: string
          page_title?: string | null
          page_type?: string | null
          page_url?: string
          scroll_depth_percent?: number | null
          session_id?: string
          time_on_page_seconds?: number | null
        }
        Relationships: []
      }
      analytics_sessions: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          device_type: string | null
          ended_at: string | null
          id: string
          ip_address: string | null
          ip_hash: string | null
          is_active: boolean | null
          landing_page: string | null
          os: string | null
          page_count: number | null
          referrer: string | null
          screen_height: number | null
          screen_width: number | null
          session_id: string
          started_at: string
          total_time_seconds: number | null
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          device_type?: string | null
          ended_at?: string | null
          id?: string
          ip_address?: string | null
          ip_hash?: string | null
          is_active?: boolean | null
          landing_page?: string | null
          os?: string | null
          page_count?: number | null
          referrer?: string | null
          screen_height?: number | null
          screen_width?: number | null
          session_id: string
          started_at?: string
          total_time_seconds?: number | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          device_type?: string | null
          ended_at?: string | null
          id?: string
          ip_address?: string | null
          ip_hash?: string | null
          is_active?: boolean | null
          landing_page?: string | null
          os?: string | null
          page_count?: number | null
          referrer?: string | null
          screen_height?: number | null
          screen_width?: number | null
          session_id?: string
          started_at?: string
          total_time_seconds?: number | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      article_comments: {
        Row: {
          article_id: string
          article_type: string
          author_email: string
          author_name: string
          content: string
          created_at: string
          id: string
          is_approved: boolean | null
          parent_id: string | null
        }
        Insert: {
          article_id: string
          article_type: string
          author_email: string
          author_name: string
          content: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          parent_id?: string | null
        }
        Update: {
          article_id?: string
          article_type?: string
          author_email?: string
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "article_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      article_votes: {
        Row: {
          article_id: string
          article_type: string
          created_at: string
          id: string
          vote_type: string
          voter_hash: string
        }
        Insert: {
          article_id: string
          article_type: string
          created_at?: string
          id?: string
          vote_type: string
          voter_hash: string
        }
        Update: {
          article_id?: string
          article_type?: string
          created_at?: string
          id?: string
          vote_type?: string
          voter_hash?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          author_id: string | null
          category_id: string | null
          chassidut: string | null
          content: string | null
          created_at: string
          excerpt: string | null
          hebrew_date: string | null
          id: string
          image_url: string | null
          is_breaking: boolean | null
          is_featured: boolean | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          scheduled_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string
          views: number | null
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          chassidut?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          hebrew_date?: string | null
          id?: string
          image_url?: string | null
          is_breaking?: boolean | null
          is_featured?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
          views?: number | null
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          chassidut?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          hebrew_date?: string | null
          id?: string
          image_url?: string | null
          is_breaking?: boolean | null
          is_featured?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      before_18_years: {
        Row: {
          author: string | null
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          images: Json
          is_published: boolean | null
          photographer: string | null
          title: string
          updated_at: string
          week_parasha: string
          year_gregorian: number
          year_hebrew: string
        }
        Insert: {
          author?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          images?: Json
          is_published?: boolean | null
          photographer?: string | null
          title: string
          updated_at?: string
          week_parasha: string
          year_gregorian: number
          year_hebrew: string
        }
        Update: {
          author?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          images?: Json
          is_published?: boolean | null
          photographer?: string | null
          title?: string
          updated_at?: string
          week_parasha?: string
          year_gregorian?: number
          year_hebrew?: string
        }
        Relationships: []
      }
      bein_hatzibur: {
        Row: {
          author: string | null
          caption: string | null
          chassidut: string | null
          created_at: string
          description: string | null
          display_order: number | null
          gregorian_date: string
          hebrew_date: string | null
          id: string
          image_url: string
          is_published: boolean | null
          location: string | null
          photographer: string | null
          short_text: string | null
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          caption?: string | null
          chassidut?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          gregorian_date?: string
          hebrew_date?: string | null
          id?: string
          image_url: string
          is_published?: boolean | null
          location?: string | null
          photographer?: string | null
          short_text?: string | null
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          caption?: string | null
          chassidut?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          gregorian_date?: string
          hebrew_date?: string | null
          id?: string
          image_url?: string
          is_published?: boolean | null
          location?: string | null
          photographer?: string | null
          short_text?: string | null
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      chassiduyot: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      drive_folder_mapping: {
        Row: {
          config_id: string | null
          created_at: string
          drive_folder_name: string
          id: string
          is_active: boolean | null
          target_section: string
          target_table: string
        }
        Insert: {
          config_id?: string | null
          created_at?: string
          drive_folder_name: string
          id?: string
          is_active?: boolean | null
          target_section: string
          target_table: string
        }
        Update: {
          config_id?: string | null
          created_at?: string
          drive_folder_name?: string
          id?: string
          is_active?: boolean | null
          target_section?: string
          target_table?: string
        }
        Relationships: [
          {
            foreignKeyName: "drive_folder_mapping_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "drive_sync_config"
            referencedColumns: ["id"]
          },
        ]
      }
      drive_section_mappings: {
        Row: {
          created_at: string
          display_name: string
          folder_name: string
          id: string
          is_active: boolean
          target_table: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          folder_name: string
          id?: string
          is_active?: boolean
          target_table: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          folder_name?: string
          id?: string
          is_active?: boolean
          target_table?: string
          updated_at?: string
        }
        Relationships: []
      }
      drive_sync_config: {
        Row: {
          access_token: string | null
          created_at: string
          folder_id: string
          folder_name: string
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          folder_id: string
          folder_name: string
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          folder_id?: string
          folder_name?: string
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      drive_sync_log: {
        Row: {
          action: string
          config_id: string | null
          created_at: string
          details: Json | null
          id: string
          status: string
        }
        Insert: {
          action: string
          config_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          status: string
        }
        Update: {
          action?: string
          config_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "drive_sync_log_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "drive_sync_config"
            referencedColumns: ["id"]
          },
        ]
      }
      drive_synced_items: {
        Row: {
          config_id: string | null
          drive_folder_id: string
          drive_folder_name: string
          error_message: string | null
          id: string
          sync_status: string
          synced_at: string
          target_record_id: string | null
          target_table: string
        }
        Insert: {
          config_id?: string | null
          drive_folder_id: string
          drive_folder_name: string
          error_message?: string | null
          id?: string
          sync_status?: string
          synced_at?: string
          target_record_id?: string | null
          target_table: string
        }
        Update: {
          config_id?: string | null
          drive_folder_id?: string
          drive_folder_name?: string
          error_message?: string | null
          id?: string
          sync_status?: string
          synced_at?: string
          target_record_id?: string | null
          target_table?: string
        }
        Relationships: [
          {
            foreignKeyName: "drive_synced_items_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "drive_sync_config"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          address: string | null
          author_id: string | null
          chassidut: string | null
          created_at: string
          description: string | null
          display_order: number | null
          event_date: string
          event_time: string | null
          event_type: string
          hebrew_date: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          location: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          author_id?: string | null
          chassidut?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          event_date: string
          event_time?: string | null
          event_type: string
          hebrew_date?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          location?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          author_id?: string | null
          chassidut?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          event_date?: string
          event_time?: string | null
          event_type?: string
          hebrew_date?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          location?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      galleries: {
        Row: {
          author_id: string | null
          chassidut: string | null
          cover_image: string | null
          created_at: string
          description: string | null
          display_order: number | null
          event_date: string | null
          event_type: string | null
          hebrew_date: string | null
          id: string
          images_with_captions: Json | null
          main_image_caption: string | null
          slug: string
          status: string
          title: string
          updated_at: string
          views: number | null
        }
        Insert: {
          author_id?: string | null
          chassidut?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          event_date?: string | null
          event_type?: string | null
          hebrew_date?: string | null
          id?: string
          images_with_captions?: Json | null
          main_image_caption?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
          views?: number | null
        }
        Update: {
          author_id?: string | null
          chassidut?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          event_date?: string | null
          event_type?: string | null
          hebrew_date?: string | null
          id?: string
          images_with_captions?: Json | null
          main_image_caption?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "galleries_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_images: {
        Row: {
          caption: string | null
          created_at: string
          gallery_id: string
          id: string
          image_url: string
          photographer: string | null
          sort_order: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          gallery_id: string
          id?: string
          image_url: string
          photographer?: string | null
          sort_order?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          gallery_id?: string
          id?: string
          image_url?: string
          photographer?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_images_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_banners: {
        Row: {
          bg_overlay: string | null
          button_link: string | null
          button_text: string | null
          created_at: string
          id: string
          image_url: string
          is_active: boolean | null
          show_button: boolean | null
          sort_order: number | null
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          bg_overlay?: string | null
          button_link?: string | null
          button_text?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean | null
          show_button?: boolean | null
          sort_order?: number | null
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          bg_overlay?: string | null
          button_link?: string | null
          button_text?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean | null
          show_button?: boolean | null
          sort_order?: number | null
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      hero_settings: {
        Row: {
          autoplay_speed: number | null
          id: string
          pause_on_hover: boolean | null
          show_arrows: boolean | null
          show_dots: boolean | null
          updated_at: string
        }
        Insert: {
          autoplay_speed?: number | null
          id?: string
          pause_on_hover?: boolean | null
          show_arrows?: boolean | null
          show_dots?: boolean | null
          updated_at?: string
        }
        Update: {
          autoplay_speed?: number | null
          id?: string
          pause_on_hover?: boolean | null
          show_arrows?: boolean | null
          show_dots?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      historical_events: {
        Row: {
          author: string | null
          chassidut: string | null
          content: Json | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          display_order: number | null
          event_decade: string | null
          event_type: string | null
          event_year_gregorian: number | null
          event_year_hebrew: string | null
          id: string
          images: Json | null
          is_published: boolean | null
          location: string | null
          photographer: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          chassidut?: string | null
          content?: Json | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          event_decade?: string | null
          event_type?: string | null
          event_year_gregorian?: number | null
          event_year_hebrew?: string | null
          id?: string
          images?: Json | null
          is_published?: boolean | null
          location?: string | null
          photographer?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          chassidut?: string | null
          content?: Json | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          event_decade?: string | null
          event_type?: string | null
          event_year_gregorian?: number | null
          event_year_hebrew?: string | null
          id?: string
          images?: Json | null
          is_published?: boolean | null
          location?: string | null
          photographer?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      news_batzibur: {
        Row: {
          author: string | null
          chassidut: string | null
          content: string
          created_at: string
          display_order: number | null
          gregorian_date: string
          hebrew_date: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_published: boolean | null
          location: string | null
          subtitle: string | null
          title: string
          updated_at: string
          views: number | null
        }
        Insert: {
          author?: string | null
          chassidut?: string | null
          content: string
          created_at?: string
          display_order?: number | null
          gregorian_date?: string
          hebrew_date?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          location?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string
          views?: number | null
        }
        Update: {
          author?: string | null
          chassidut?: string | null
          content?: string
          created_at?: string
          display_order?: number | null
          gregorian_date?: string
          hebrew_date?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          location?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string
          views?: number | null
        }
        Relationships: []
      }
      newspaper_issues: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          gregorian_date: string
          hebrew_date: string | null
          id: string
          is_published: boolean | null
          issue_number: number
          parasha: string | null
          pdf_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          gregorian_date: string
          hebrew_date?: string | null
          id?: string
          is_published?: boolean | null
          issue_number: number
          parasha?: string | null
          pdf_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          gregorian_date?: string
          hebrew_date?: string | null
          id?: string
          is_published?: boolean | null
          issue_number?: number
          parasha?: string | null
          pdf_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      photographers: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      siah_hatzibur: {
        Row: {
          author: string | null
          chassidut: string | null
          content: Json
          content_blocks: Json | null
          cover_image_url: string | null
          created_at: string
          display_order: number | null
          gregorian_date: string
          hebrew_date: string | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          subtitle: string | null
          tags: string[] | null
          title: string
          updated_at: string
          views: number | null
        }
        Insert: {
          author?: string | null
          chassidut?: string | null
          content?: Json
          content_blocks?: Json | null
          cover_image_url?: string | null
          created_at?: string
          display_order?: number | null
          gregorian_date?: string
          hebrew_date?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          subtitle?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          views?: number | null
        }
        Update: {
          author?: string | null
          chassidut?: string | null
          content?: Json
          content_blocks?: Json | null
          cover_image_url?: string | null
          created_at?: string
          display_order?: number | null
          gregorian_date?: string
          hebrew_date?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          subtitle?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          views?: number | null
        }
        Relationships: []
      }
      site_pages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_published: boolean | null
          meta_description: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "site_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      source_code_export: {
        Row: {
          content: string
          created_at: string | null
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          is_binary: boolean | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          file_path: string
          file_size?: number | null
          file_type?: string
          id?: string
          is_binary?: boolean | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          is_binary?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      videos: {
        Row: {
          author_id: string | null
          category_id: string | null
          chassidut: string | null
          created_at: string
          description: string | null
          display_order: number | null
          duration: string | null
          id: string
          is_featured: boolean | null
          published_at: string | null
          slug: string
          status: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string
          views: number | null
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          chassidut?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          duration?: string | null
          id?: string
          is_featured?: boolean | null
          published_at?: string | null
          slug: string
          status?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url: string
          views?: number | null
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          chassidut?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          duration?: string | null
          id?: string
          is_featured?: boolean | null
          published_at?: string | null
          slug?: string
          status?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "videos_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      writers: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: { Args: { user_id: string }; Returns: string }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
