export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      audit_trail: {
        Row: {
          action: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string
          table_name: string
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          table_name: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          table_name?: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      autonomous_agents: {
        Row: {
          agent_name: string
          agent_type: string
          config: Json
          created_at: string | null
          daily_budget: number | null
          id: string
          last_activity: string | null
          roi: number | null
          status: string | null
          total_earned: number | null
          total_spent: number | null
          updated_at: string | null
          user_id: string | null
          vm_instance_id: string | null
        }
        Insert: {
          agent_name: string
          agent_type: string
          config?: Json
          created_at?: string | null
          daily_budget?: number | null
          id?: string
          last_activity?: string | null
          roi?: number | null
          status?: string | null
          total_earned?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string | null
          vm_instance_id?: string | null
        }
        Update: {
          agent_name?: string
          agent_type?: string
          config?: Json
          created_at?: string | null
          daily_budget?: number | null
          id?: string
          last_activity?: string | null
          roi?: number | null
          status?: string | null
          total_earned?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string | null
          vm_instance_id?: string | null
        }
        Relationships: []
      }
      autonomous_optimization_history: {
        Row: {
          created_at: string | null
          id: string
          new_value: Json
          optimization_type: string
          previous_value: Json
          stream_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          new_value: Json
          optimization_type: string
          previous_value: Json
          stream_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          new_value?: Json
          optimization_type?: string
          previous_value?: Json
          stream_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "autonomous_optimization_history_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "autonomous_revenue_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      autonomous_revenue_alerts: {
        Row: {
          alert_type: string
          created_at: string
          details: Json
          id: string
          message: string
          resolution_notes: string | null
          resolved_at: string | null
          severity: string
          status: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          details: Json
          id?: string
          message: string
          resolution_notes?: string | null
          resolved_at?: string | null
          severity: string
          status?: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          details?: Json
          id?: string
          message?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
        }
        Relationships: []
      }
      autonomous_revenue_metrics: {
        Row: {
          average_transfer_amount: number | null
          created_at: string
          failed_transfers: number
          id: string
          metric_date: string
          optimization_impact: Json | null
          revenue_by_category: Json
          revenue_by_source: Json
          successful_transfers: number
          total_revenue: number
          updated_at: string
        }
        Insert: {
          average_transfer_amount?: number | null
          created_at?: string
          failed_transfers?: number
          id?: string
          metric_date: string
          optimization_impact?: Json | null
          revenue_by_category?: Json
          revenue_by_source?: Json
          successful_transfers?: number
          total_revenue?: number
          updated_at?: string
        }
        Update: {
          average_transfer_amount?: number | null
          created_at?: string
          failed_transfers?: number
          id?: string
          metric_date?: string
          optimization_impact?: Json | null
          revenue_by_category?: Json
          revenue_by_source?: Json
          successful_transfers?: number
          total_revenue?: number
          updated_at?: string
        }
        Relationships: []
      }
      autonomous_revenue_optimization: {
        Row: {
          applied_at: string | null
          created_at: string
          id: string
          metadata: Json
          new_config: Json
          optimization_type: string
          performance_metrics: Json
          previous_config: Json
          processing_time_ms: number | null
          reverted_at: string | null
          status: string
          success_rate: number | null
        }
        Insert: {
          applied_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          new_config: Json
          optimization_type: string
          performance_metrics: Json
          previous_config: Json
          processing_time_ms?: number | null
          reverted_at?: string | null
          status?: string
          success_rate?: number | null
        }
        Update: {
          applied_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          new_config?: Json
          optimization_type?: string
          performance_metrics?: Json
          previous_config?: Json
          processing_time_ms?: number | null
          reverted_at?: string | null
          status?: string
          success_rate?: number | null
        }
        Relationships: []
      }
      autonomous_revenue_sources: {
        Row: {
          config: Json
          created_at: string
          daily_limit: number | null
          daily_used: number
          id: string
          metrics: Json
          priority: number
          source_name: string
          source_type: string
          status: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          daily_limit?: number | null
          daily_used?: number
          id?: string
          metrics?: Json
          priority?: number
          source_name: string
          source_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          daily_limit?: number | null
          daily_used?: number
          id?: string
          metrics?: Json
          priority?: number
          source_name?: string
          source_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      autonomous_revenue_streams: {
        Row: {
          created_at: string | null
          id: string
          metrics: Json | null
          name: string
          settings: Json | null
          status: string
          strategy: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metrics?: Json | null
          name: string
          settings?: Json | null
          status?: string
          strategy: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metrics?: Json | null
          name?: string
          settings?: Json | null
          status?: string
          strategy?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      autonomous_revenue_stripe_config: {
        Row: {
          auto_transfer: boolean | null
          bank_account_id: string
          created_at: string | null
          id: string
          last_transfer_at: string | null
          stripe_account_id: string
          stripe_api_key: string
          transfer_frequency: string | null
          transfer_threshold: number | null
          updated_at: string | null
        }
        Insert: {
          auto_transfer?: boolean | null
          bank_account_id: string
          created_at?: string | null
          id?: string
          last_transfer_at?: string | null
          stripe_account_id: string
          stripe_api_key: string
          transfer_frequency?: string | null
          transfer_threshold?: number | null
          updated_at?: string | null
        }
        Update: {
          auto_transfer?: boolean | null
          bank_account_id?: string
          created_at?: string | null
          id?: string
          last_transfer_at?: string | null
          stripe_account_id?: string
          stripe_api_key?: string
          transfer_frequency?: string | null
          transfer_threshold?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      autonomous_revenue_stripe_integration: {
        Row: {
          account_id: string | null
          api_key: string | null
          auto_transfer: boolean | null
          created_at: string | null
          id: string
          last_transfer_at: string | null
          metadata: Json | null
          minimum_transfer_amount: number | null
          status: string | null
          transfer_frequency: string | null
          updated_at: string | null
          webhook_secret: string | null
        }
        Insert: {
          account_id?: string | null
          api_key?: string | null
          auto_transfer?: boolean | null
          created_at?: string | null
          id?: string
          last_transfer_at?: string | null
          metadata?: Json | null
          minimum_transfer_amount?: number | null
          status?: string | null
          transfer_frequency?: string | null
          updated_at?: string | null
          webhook_secret?: string | null
        }
        Update: {
          account_id?: string | null
          api_key?: string | null
          auto_transfer?: boolean | null
          created_at?: string | null
          id?: string
          last_transfer_at?: string | null
          metadata?: Json | null
          minimum_transfer_amount?: number | null
          status?: string | null
          transfer_frequency?: string | null
          updated_at?: string | null
          webhook_secret?: string | null
        }
        Relationships: []
      }
      autonomous_revenue_task_queue: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          max_retries: number
          payload: Json
          priority: number
          result: Json | null
          retry_count: number
          started_at: string | null
          status: string
          task_type: string
          worker_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          max_retries?: number
          payload: Json
          priority?: number
          result?: Json | null
          retry_count?: number
          started_at?: string | null
          status?: string
          task_type: string
          worker_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          max_retries?: number
          payload?: Json
          priority?: number
          result?: Json | null
          retry_count?: number
          started_at?: string | null
          status?: string
          task_type?: string
          worker_id?: string | null
        }
        Relationships: []
      }
      autonomous_revenue_transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          metadata: Json | null
          status: string
          stream_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          status?: string
          stream_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          status?: string
          stream_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "autonomous_revenue_transactions_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "autonomous_revenue_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      autonomous_revenue_transfer_logs: {
        Row: {
          amount: number
          created_at: string
          destination_account: string
          id: string
          metadata: Json
          source_account: string
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          destination_account: string
          id?: string
          metadata?: Json
          source_account: string
          status: string
        }
        Update: {
          amount?: number
          created_at?: string
          destination_account?: string
          id?: string
          metadata?: Json
          source_account?: string
          status?: string
        }
        Relationships: []
      }
      autonomous_revenue_transfers: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string | null
          currency: string | null
          error_message: string | null
          id: string
          source_streams: Json | null
          status: string
          stripe_transfer_id: string | null
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          error_message?: string | null
          id?: string
          source_streams?: Json | null
          status?: string
          stripe_transfer_id?: string | null
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          error_message?: string | null
          id?: string
          source_streams?: Json | null
          status?: string
          stripe_transfer_id?: string | null
        }
        Relationships: []
      }
      autonomous_revenue_worker_pool: {
        Row: {
          config: Json
          created_at: string
          current_workers: number
          id: string
          max_workers: number
          status: string
          updated_at: string
          worker_type: string
        }
        Insert: {
          config?: Json
          created_at?: string
          current_workers?: number
          id?: string
          max_workers?: number
          status?: string
          updated_at?: string
          worker_type: string
        }
        Update: {
          config?: Json
          created_at?: string
          current_workers?: number
          id?: string
          max_workers?: number
          status?: string
          updated_at?: string
          worker_type?: string
        }
        Relationships: []
      }
      autonomous_revenue_workers: {
        Row: {
          config: Json
          created_at: string
          id: string
          last_heartbeat: string
          metadata: Json
          metrics: Json
          status: string
          updated_at: string
          worker_type: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          last_heartbeat?: string
          metadata?: Json
          metrics?: Json
          status?: string
          updated_at?: string
          worker_type: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          last_heartbeat?: string
          metadata?: Json
          metrics?: Json
          status?: string
          updated_at?: string
          worker_type?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          agent_id: string | null
          bid_amount: number | null
          campaign_name: string
          campaign_type: string
          clicks: number | null
          conversions: number | null
          created_at: string | null
          daily_budget: number | null
          id: string
          impressions: number | null
          revenue: number | null
          spend: number | null
          status: string | null
          target_keywords: Json | null
          updated_at: string | null
        }
        Insert: {
          agent_id?: string | null
          bid_amount?: number | null
          campaign_name: string
          campaign_type: string
          clicks?: number | null
          conversions?: number | null
          created_at?: string | null
          daily_budget?: number | null
          id?: string
          impressions?: number | null
          revenue?: number | null
          spend?: number | null
          status?: string | null
          target_keywords?: Json | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string | null
          bid_amount?: number | null
          campaign_name?: string
          campaign_type?: string
          clicks?: number | null
          conversions?: number | null
          created_at?: string | null
          daily_budget?: number | null
          id?: string
          impressions?: number | null
          revenue?: number | null
          spend?: number | null
          status?: string | null
          target_keywords?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "autonomous_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_out_requests: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          payment_details: Json
          payment_method: string
          processed_at: string | null
          status: string | null
          transaction_id: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          payment_details: Json
          payment_method: string
          processed_at?: string | null
          status?: string | null
          transaction_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          payment_details?: Json
          payment_method?: string
          processed_at?: string | null
          status?: string | null
          transaction_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chart_of_accounts: {
        Row: {
          account_code: string
          account_name: string
          account_type: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          normal_balance: string
          parent_account_id: string | null
          updated_at: string
        }
        Insert: {
          account_code: string
          account_name: string
          account_type: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          normal_balance: string
          parent_account_id?: string | null
          updated_at?: string
        }
        Update: {
          account_code?: string
          account_name?: string
          account_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          normal_balance?: string
          parent_account_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chart_of_accounts_parent_account_id_fkey"
            columns: ["parent_account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_checks: {
        Row: {
          check_date: string
          check_result: Json
          check_type: string
          checked_by: string | null
          compliance_score: number | null
          entity_id: string
          entity_type: string
          id: string
          notes: string | null
          passed: boolean
        }
        Insert: {
          check_date?: string
          check_result: Json
          check_type: string
          checked_by?: string | null
          compliance_score?: number | null
          entity_id: string
          entity_type: string
          id?: string
          notes?: string | null
          passed: boolean
        }
        Update: {
          check_date?: string
          check_result?: Json
          check_type?: string
          checked_by?: string | null
          compliance_score?: number | null
          entity_id?: string
          entity_type?: string
          id?: string
          notes?: string | null
          passed?: boolean
        }
        Relationships: []
      }
      compliance_logs: {
        Row: {
          check_type: string
          details: Json | null
          id: string
          order_id: string | null
          performed_at: string | null
          score: number | null
          status: string
        }
        Insert: {
          check_type: string
          details?: Json | null
          id?: string
          order_id?: string | null
          performed_at?: string | null
          score?: number | null
          status: string
        }
        Update: {
          check_type?: string
          details?: Json | null
          id?: string
          order_id?: string | null
          performed_at?: string | null
          score?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      earnings: {
        Row: {
          agent_id: string | null
          amount: number
          campaign_id: string | null
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          source: string
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          amount: number
          campaign_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          source: string
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          amount?: number
          campaign_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          source?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "earnings_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "autonomous_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "earnings_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      exchange_rates: {
        Row: {
          id: number
          rates: Json
          updated_at: string | null
        }
        Insert: {
          id?: number
          rates: Json
          updated_at?: string | null
        }
        Update: {
          id?: number
          rates?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          created_at: string
          created_by: string | null
          currency: string
          description: string
          id: string
          reference_number: string | null
          status: string
          stripe_payment_id: string | null
          stripe_payout_id: string | null
          total_amount: number
          transaction_date: string
          transaction_number: string
          transaction_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency?: string
          description: string
          id?: string
          reference_number?: string | null
          status?: string
          stripe_payment_id?: string | null
          stripe_payout_id?: string | null
          total_amount: number
          transaction_date: string
          transaction_number: string
          transaction_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string
          id?: string
          reference_number?: string | null
          status?: string
          stripe_payment_id?: string | null
          stripe_payout_id?: string | null
          total_amount?: number
          transaction_date?: string
          transaction_number?: string
          transaction_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      github_repos: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          metrics: Json
          repo_name: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          metrics?: Json
          repo_name: string
          status: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          metrics?: Json
          repo_name?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          account_id: string
          created_at: string
          credit_amount: number | null
          debit_amount: number | null
          description: string | null
          id: string
          transaction_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          credit_amount?: number | null
          debit_amount?: number | null
          description?: string | null
          id?: string
          transaction_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          credit_amount?: number | null
          debit_amount?: number | null
          description?: string | null
          id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "actual_revenue_in_stripe"
            referencedColumns: ["transaction_id"]
          },
          {
            foreignKeyName: "journal_entries_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "financial_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          channel: string
          company: string | null
          created_at: string | null
          email: string
          id: string
          interest_level: number | null
          name: string
          notes: string | null
          potential_revenue: number | null
          status: string
          stream_id: string | null
          updated_at: string | null
        }
        Insert: {
          channel: string
          company?: string | null
          created_at?: string | null
          email: string
          id?: string
          interest_level?: number | null
          name: string
          notes?: string | null
          potential_revenue?: number | null
          status: string
          stream_id?: string | null
          updated_at?: string | null
        }
        Update: {
          channel?: string
          company?: string | null
          created_at?: string | null
          email?: string
          id?: string
          interest_level?: number | null
          name?: string
          notes?: string | null
          potential_revenue?: number | null
          status?: string
          stream_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "revenue_analytics"
            referencedColumns: ["stream_id"]
          },
          {
            foreignKeyName: "leads_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "revenue_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      optimization_history: {
        Row: {
          created_at: string | null
          id: string
          new_value: Json | null
          optimization_type: string
          performance_impact: number | null
          previous_value: Json | null
          stream_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          new_value?: Json | null
          optimization_type: string
          performance_impact?: number | null
          previous_value?: Json | null
          stream_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          new_value?: Json | null
          optimization_type?: string
          performance_impact?: number | null
          previous_value?: Json | null
          stream_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "optimization_history_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "revenue_analytics"
            referencedColumns: ["stream_id"]
          },
          {
            foreignKeyName: "optimization_history_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "revenue_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          completed_at: string | null
          confirmed_at: string | null
          created_at: string | null
          crypto_amount: number
          crypto_tx_hash: string | null
          crypto_type: string
          customer_email: string | null
          customer_phone: string | null
          error_message: string | null
          exchange_rate: number
          expires_at: string | null
          failed_at: string | null
          id: string
          new_column_name: string | null
          payment_method: string
          payment_tx_hash: string | null
          service_fee: number
          status: string
          updated_at: string | null
          usd_amount: number
          verified_amount: number | null
          wallet_address: string
        }
        Insert: {
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          crypto_amount: number
          crypto_tx_hash?: string | null
          crypto_type: string
          customer_email?: string | null
          customer_phone?: string | null
          error_message?: string | null
          exchange_rate: number
          expires_at?: string | null
          failed_at?: string | null
          id: string
          new_column_name?: string | null
          payment_method: string
          payment_tx_hash?: string | null
          service_fee: number
          status?: string
          updated_at?: string | null
          usd_amount: number
          verified_amount?: number | null
          wallet_address: string
        }
        Update: {
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          crypto_amount?: number
          crypto_tx_hash?: string | null
          crypto_type?: string
          customer_email?: string | null
          customer_phone?: string | null
          error_message?: string | null
          exchange_rate?: number
          expires_at?: string | null
          failed_at?: string | null
          id?: string
          new_column_name?: string | null
          payment_method?: string
          payment_tx_hash?: string | null
          service_fee?: number
          status?: string
          updated_at?: string | null
          usd_amount?: number
          verified_amount?: number | null
          wallet_address?: string
        }
        Relationships: []
      }
      payment_addresses: {
        Row: {
          created_at: string | null
          crypto_type: string
          deposit_address: string
          expected_amount: number
          id: string
          order_id: string | null
        }
        Insert: {
          created_at?: string | null
          crypto_type: string
          deposit_address: string
          expected_amount: number
          id?: string
          order_id?: string | null
        }
        Update: {
          created_at?: string | null
          crypto_type?: string
          deposit_address?: string
          expected_amount?: number
          id?: string
          order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_addresses_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_obligations: {
        Row: {
          allocation_amount: number
          completion_date: string | null
          contract_id: string | null
          created_at: string | null
          description: string
          id: string
          obligation_metadata: Json | null
          standalone_selling_price: number
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          allocation_amount: number
          completion_date?: string | null
          contract_id?: string | null
          created_at?: string | null
          description: string
          id?: string
          obligation_metadata?: Json | null
          standalone_selling_price: number
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          allocation_amount?: number
          completion_date?: string | null
          contract_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          obligation_metadata?: Json | null
          standalone_selling_price?: number
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_obligations_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "revenue_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          agent_tier: string | null
          avatar_url: string | null
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          metadata: Json | null
          total_earnings: number | null
          updated_at: string | null
          username: string | null
          wallet_balance: number | null
        }
        Insert: {
          agent_tier?: string | null
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          metadata?: Json | null
          total_earnings?: number | null
          updated_at?: string | null
          username?: string | null
          wallet_balance?: number | null
        }
        Update: {
          agent_tier?: string | null
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          metadata?: Json | null
          total_earnings?: number | null
          updated_at?: string | null
          username?: string | null
          wallet_balance?: number | null
        }
        Relationships: []
      }
      revenue: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          id: number
          payment_status: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency: string
          id?: never
          payment_status: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          id?: never
          payment_status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      revenue_allocations: {
        Row: {
          allocation_amount: number
          allocation_date: string
          allocation_metadata: Json | null
          allocation_method: string
          contract_id: string | null
          created_at: string | null
          id: string
          obligation_id: string | null
        }
        Insert: {
          allocation_amount: number
          allocation_date: string
          allocation_metadata?: Json | null
          allocation_method: string
          contract_id?: string | null
          created_at?: string | null
          id?: string
          obligation_id?: string | null
        }
        Update: {
          allocation_amount?: number
          allocation_date?: string
          allocation_metadata?: Json | null
          allocation_method?: string
          contract_id?: string | null
          created_at?: string | null
          id?: string
          obligation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "revenue_allocations_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "revenue_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_allocations_obligation_id_fkey"
            columns: ["obligation_id"]
            isOneToOne: false
            referencedRelation: "performance_obligations"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_contracts: {
        Row: {
          contract_date: string
          contract_metadata: Json | null
          contract_number: string
          created_at: string | null
          currency: string | null
          customer_id: string | null
          end_date: string | null
          id: string
          payment_terms: Json | null
          start_date: string
          status: string | null
          total_contract_value: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          contract_date: string
          contract_metadata?: Json | null
          contract_number: string
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          end_date?: string | null
          id?: string
          payment_terms?: Json | null
          start_date: string
          status?: string | null
          total_contract_value: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          contract_date?: string
          contract_metadata?: Json | null
          contract_number?: string
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          end_date?: string | null
          id?: string
          payment_terms?: Json | null
          start_date?: string
          status?: string | null
          total_contract_value?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      revenue_recognition_events: {
        Row: {
          accounting_period: string
          agent_id: string | null
          amount: number
          campaign_id: string | null
          contract_id: string | null
          created_at: string | null
          deferred_revenue_impact: number | null
          event_metadata: Json | null
          id: string
          obligation_id: string | null
          recognition_basis: string
          recognition_date: string
          recognition_method: string
        }
        Insert: {
          accounting_period: string
          agent_id?: string | null
          amount: number
          campaign_id?: string | null
          contract_id?: string | null
          created_at?: string | null
          deferred_revenue_impact?: number | null
          event_metadata?: Json | null
          id?: string
          obligation_id?: string | null
          recognition_basis: string
          recognition_date: string
          recognition_method: string
        }
        Update: {
          accounting_period?: string
          agent_id?: string | null
          amount?: number
          campaign_id?: string | null
          contract_id?: string | null
          created_at?: string | null
          deferred_revenue_impact?: number | null
          event_metadata?: Json | null
          id?: string
          obligation_id?: string | null
          recognition_basis?: string
          recognition_date?: string
          recognition_method?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenue_recognition_events_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "autonomous_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_recognition_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_recognition_events_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "revenue_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_recognition_events_obligation_id_fkey"
            columns: ["obligation_id"]
            isOneToOne: false
            referencedRelation: "performance_obligations"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_schedules: {
        Row: {
          contract_id: string
          created_at: string
          id: string
          monthly_amount: number
          recognition_end_date: string
          recognition_method: string
          recognition_start_date: string
          recognized_to_date: number | null
          remaining_amount: number
          status: string
          stripe_subscription_id: string | null
          total_contract_value: number
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          contract_id: string
          created_at?: string
          id?: string
          monthly_amount: number
          recognition_end_date: string
          recognition_method?: string
          recognition_start_date: string
          recognized_to_date?: number | null
          remaining_amount: number
          status?: string
          stripe_subscription_id?: string | null
          total_contract_value: number
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          contract_id?: string
          created_at?: string
          id?: string
          monthly_amount?: number
          recognition_end_date?: string
          recognition_method?: string
          recognition_start_date?: string
          recognized_to_date?: number | null
          remaining_amount?: number
          status?: string
          stripe_subscription_id?: string | null
          total_contract_value?: number
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenue_schedules_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "actual_revenue_in_stripe"
            referencedColumns: ["transaction_id"]
          },
          {
            foreignKeyName: "revenue_schedules_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "financial_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_streams: {
        Row: {
          config: Json
          created_at: string | null
          id: string
          metrics: Json
          name: string
          status: string
          type: string
          updated_at: string | null
        }
        Insert: {
          config: Json
          created_at?: string | null
          id?: string
          metrics?: Json
          name: string
          status: string
          type: string
          updated_at?: string | null
        }
        Update: {
          config?: Json
          created_at?: string | null
          id?: string
          metrics?: Json
          name?: string
          status?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      revenue_transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          id: string
          metadata: Json | null
          status: string
          stream_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          id?: string
          metadata?: Json | null
          status: string
          stream_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          id?: string
          metadata?: Json | null
          status?: string
          stream_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "revenue_transactions_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "revenue_analytics"
            referencedColumns: ["stream_id"]
          },
          {
            foreignKeyName: "revenue_transactions_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "revenue_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_config: {
        Row: {
          created_at: string | null
          id: string
          is_secret: boolean | null
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_secret?: boolean | null
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_secret?: boolean | null
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      stripe_reconciliation: {
        Row: {
          amount_internal: number | null
          amount_stripe: number
          created_at: string
          id: string
          internal_transaction_id: string | null
          reconciled_at: string | null
          reconciled_by: string | null
          reconciliation_status: string
          stripe_object_id: string
          stripe_object_type: string
          variance: number | null
        }
        Insert: {
          amount_internal?: number | null
          amount_stripe: number
          created_at?: string
          id?: string
          internal_transaction_id?: string | null
          reconciled_at?: string | null
          reconciled_by?: string | null
          reconciliation_status?: string
          stripe_object_id: string
          stripe_object_type: string
          variance?: number | null
        }
        Update: {
          amount_internal?: number | null
          amount_stripe?: number
          created_at?: string
          id?: string
          internal_transaction_id?: string | null
          reconciled_at?: string | null
          reconciled_by?: string | null
          reconciliation_status?: string
          stripe_object_id?: string
          stripe_object_type?: string
          variance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stripe_reconciliation_internal_transaction_id_fkey"
            columns: ["internal_transaction_id"]
            isOneToOne: false
            referencedRelation: "actual_revenue_in_stripe"
            referencedColumns: ["transaction_id"]
          },
          {
            foreignKeyName: "stripe_reconciliation_internal_transaction_id_fkey"
            columns: ["internal_transaction_id"]
            isOneToOne: false
            referencedRelation: "financial_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_logs: {
        Row: {
          created_at: string
          database_status: boolean
          id: string
          replit_status: boolean
          stripe_status: boolean
          sync_timestamp: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          database_status?: boolean
          id?: string
          replit_status?: boolean
          stripe_status?: boolean
          sync_timestamp?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          database_status?: boolean
          id?: string
          replit_status?: boolean
          stripe_status?: boolean
          sync_timestamp?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transaction_logs: {
        Row: {
          amount: number
          block_number: number | null
          confirmed_at: string | null
          created_at: string | null
          currency: string
          gas_price: number | null
          gas_used: number | null
          id: string
          order_id: string | null
          status: string
          tx_hash: string
          tx_type: string
        }
        Insert: {
          amount: number
          block_number?: number | null
          confirmed_at?: string | null
          created_at?: string | null
          currency: string
          gas_price?: number | null
          gas_used?: number | null
          id?: string
          order_id?: string | null
          status?: string
          tx_hash: string
          tx_type: string
        }
        Update: {
          amount?: number
          block_number?: number | null
          confirmed_at?: string | null
          created_at?: string | null
          currency?: string
          gas_price?: number | null
          gas_used?: number | null
          id?: string
          order_id?: string | null
          status?: string
          tx_hash?: string
          tx_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          description: string | null
          id: number
          status: string
          transaction_date: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          description?: string | null
          id?: never
          status: string
          transaction_date?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          description?: string | null
          id?: never
          status?: string
          transaction_date?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      treasury_operations: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          description: string | null
          from_address: string | null
          id: string
          operation_type: string
          performed_by: string | null
          to_address: string | null
          tx_hash: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency: string
          description?: string | null
          from_address?: string | null
          id?: string
          operation_type: string
          performed_by?: string | null
          to_address?: string | null
          tx_hash?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          description?: string | null
          from_address?: string | null
          id?: string
          operation_type?: string
          performed_by?: string | null
          to_address?: string | null
          tx_hash?: string | null
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          ip_address: unknown | null
          last_activity: string | null
          session_token: string
          user_agent: string | null
          wallet_address: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown | null
          last_activity?: string | null
          session_token: string
          user_agent?: string | null
          wallet_address?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown | null
          last_activity?: string | null
          session_token?: string
          user_agent?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      vm_instances: {
        Row: {
          assigned_agent_id: string | null
          cost_per_hour: number | null
          cpu_usage: number | null
          created_at: string | null
          id: string
          instance_id: string
          instance_type: string
          memory_usage: number | null
          provider: string
          region: string
          started_at: string | null
          status: string | null
          stopped_at: string | null
          total_cost: number | null
        }
        Insert: {
          assigned_agent_id?: string | null
          cost_per_hour?: number | null
          cpu_usage?: number | null
          created_at?: string | null
          id?: string
          instance_id: string
          instance_type: string
          memory_usage?: number | null
          provider: string
          region: string
          started_at?: string | null
          status?: string | null
          stopped_at?: string | null
          total_cost?: number | null
        }
        Update: {
          assigned_agent_id?: string | null
          cost_per_hour?: number | null
          cpu_usage?: number | null
          created_at?: string | null
          id?: string
          instance_id?: string
          instance_type?: string
          memory_usage?: number | null
          provider?: string
          region?: string
          started_at?: string | null
          status?: string | null
          stopped_at?: string | null
          total_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vm_instances_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "autonomous_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_logs: {
        Row: {
          created_at: string | null
          id: string
          order_id: string | null
          payload: Json
          processed: boolean | null
          processed_at: string | null
          response_body: string | null
          response_status: number | null
          webhook_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          payload: Json
          processed?: boolean | null
          processed_at?: string | null
          response_body?: string | null
          response_status?: number | null
          webhook_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          payload?: Json
          processed?: boolean | null
          processed_at?: string | null
          response_body?: string | null
          response_status?: number | null
          webhook_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      actual_revenue_in_stripe: {
        Row: {
          amount_internal: number | null
          amount_stripe: number | null
          created_at: string | null
          currency: string | null
          description: string | null
          is_accurate: boolean | null
          reconciled_at: string | null
          reconciliation_status: string | null
          status: string | null
          stripe_object_type: string | null
          stripe_payment_id: string | null
          total_amount: number | null
          transaction_date: string | null
          transaction_id: string | null
          transaction_number: string | null
          updated_at: string | null
          variance: number | null
        }
        Relationships: []
      }
      autonomous_revenue_dashboard: {
        Row: {
          active_sources: number | null
          active_workers: number | null
          dashboard_updated_at: string | null
          failed_tasks_24h: number | null
          pending_tasks: number | null
          processing_tasks: number | null
          revenue_24h: number | null
          revenue_7d: number | null
          success_rate_24h: number | null
          tasks_per_hour_per_worker: number | null
          total_revenue: number | null
        }
        Relationships: []
      }
      available_funds: {
        Row: {
          available_balance: number | null
          calculated_at: string | null
          total_revenue: number | null
          total_withdrawals: number | null
        }
        Relationships: []
      }
      order_analytics: {
        Row: {
          avg_order_size: number | null
          crypto_type: string | null
          date: string | null
          order_count: number | null
          status: string | null
          total_crypto: number | null
          total_fees: number | null
          total_usd: number | null
        }
        Relationships: []
      }
      revenue_analytics: {
        Row: {
          average_transaction: number | null
          daily_revenue: number | null
          days_active: number | null
          first_transaction: string | null
          last_transaction: string | null
          stream_id: string | null
          stream_name: string | null
          stream_type: string | null
          total_revenue: number | null
          transaction_count: number | null
        }
        Relationships: []
      }
      treasury_balance_history: {
        Row: {
          currency: string | null
          hour: string | null
          net_change: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      adjust_source_pricing: {
        Args: { p_source_name: string; p_adjustment_factor: number }
        Returns: boolean
      }
      allocate_agent_budget: {
        Args: { agent_id: string }
        Returns: Json
      }
      allocate_transaction_price: {
        Args: { p_contract_id: string; p_allocation_method?: string }
        Returns: Json
      }
      calculate_daily_revenue_metrics: {
        Args: { p_date?: string }
        Returns: Json
      }
      claim_revenue_task: {
        Args: { p_worker_id: string; p_worker_type: string }
        Returns: Json
      }
      claim_revenue_tasks: {
        Args: {
          p_worker_id: string
          p_worker_type: string
          p_batch_size?: number
        }
        Returns: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          max_retries: number
          payload: Json
          priority: number
          result: Json | null
          retry_count: number
          started_at: string | null
          status: string
          task_type: string
          worker_id: string | null
        }[]
      }
      complete_revenue_task: {
        Args: {
          p_worker_id: string
          p_task_id: string
          p_success: boolean
          p_result?: Json
          p_error_message?: string
        }
        Returns: Json
      }
      consolidate_and_send_to_stripe: {
        Args:
          | {
              p_master_user_id: string
              p_period_start?: string
              p_period_end?: string
            }
          | { p_period_start?: string; p_period_end?: string }
        Returns: Json
      }
      create_revenue_transfer_job: {
        Args: { p_frequency?: string }
        Returns: Json
      }
      daily_revenue_consolidation: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      daily_volume: {
        Args: { date_param?: string }
        Returns: {
          total_orders: number
          total_volume_usd: number
          completed_orders: number
          completed_volume_usd: number
          total_fees: number
        }[]
      }
      decrement_worker_count: {
        Args: { p_worker_type: string }
        Returns: boolean
      }
      expire_old_orders: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_autonomous_revenue: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_new_campaigns: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_revenue_for_active_streams: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_revenue_for_stream: {
        Args: { p_stream_id: string }
        Returns: number
      }
      generate_revenue_report: {
        Args:
          | { p_start_date: string; p_end_date: string }
          | { p_start_date: string; p_end_date: string; p_report_type?: string }
        Returns: {
          stream_id: string
          stream_name: string
          stream_type: string
          total_revenue: number
          transaction_count: number
          average_transaction: number
          growth_rate: number
        }[]
      }
      generate_revenue_tasks: {
        Args: { p_batch_size?: number }
        Returns: Json
      }
      generate_test_revenue: {
        Args: { p_user_id: string; p_amount: number; p_count?: number }
        Returns: Json
      }
      get_autonomous_revenue_stats: {
        Args: Record<PropertyKey, never> | { p_time_period?: string }
        Returns: {
          total_revenue: number
          active_streams: number
          inactive_streams: number
          top_strategy: string
          top_strategy_revenue: number
          avg_transaction_amount: number
          total_transactions: number
        }[]
      }
      get_revenue_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      increment_worker_count: {
        Args: { p_worker_type: string }
        Returns: boolean
      }
      initialize_autonomous_revenue_system: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      launch_new_agents: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      log_transaction: {
        Args: {
          p_user_id: string
          p_amount: number
          p_status: string
          p_description: string
        }
        Returns: undefined
      }
      monitor_revenue_system: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      optimize_autonomous_revenue_streams: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      optimize_campaign_bidding: {
        Args: { campaign_id: string; max_adjustment_percent?: number }
        Returns: Json
      }
      optimize_campaign_revenue: {
        Args: {
          p_campaign_id: string
          p_optimization_target?: string
          p_lookback_days?: number
        }
        Returns: Json
      }
      optimize_campaigns: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      optimize_revenue_system: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      optimize_revenue_transfers: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      optimize_underperforming_streams: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      parallel_revenue_processor: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      process_autonomous_revenue_transfers: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      process_cash_out_request: {
        Args: { request_id: string }
        Returns: Json
      }
      record_and_send_to_stripe: {
        Args: {
          p_user_id: string
          p_amount: number
          p_description: string
          p_currency?: string
          p_metadata?: Json
        }
        Returns: Json
      }
      run_autonomous_monetization_engine: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      run_autonomous_revenue_scheduler: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      scale_revenue_workers: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      scale_vm_resources: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      scheduled_revenue_transfer: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      setup_autonomous_revenue_stripe: {
        Args: {
          p_stripe_account_id: string
          p_stripe_api_key: string
          p_bank_account_id: string
          p_auto_transfer?: boolean
          p_transfer_threshold?: number
          p_transfer_frequency?: string
        }
        Returns: string
      }
      setup_revenue_transfer_schedule: {
        Args: { p_frequency?: string }
        Returns: string
      }
      setup_stripe_integration: {
        Args:
          | {
              p_api_key: string
              p_account_id: string
              p_webhook_secret?: string
              p_auto_transfer?: boolean
              p_transfer_frequency?: string
              p_minimum_transfer_amount?: number
            }
          | {
              p_auto_transfer?: boolean
              p_transfer_frequency?: string
              p_minimum_transfer_amount?: number
            }
        Returns: string
      }
      simulate_autonomous_revenue: {
        Args: { p_days?: number; p_intensity?: string }
        Returns: {
          agent_id: string
          agent_name: string
          campaign_id: string
          campaign_name: string
          day_number: number
          spend: number
          revenue: number
          profit: number
          roi: number
        }[]
      }
      start_autonomous_revenue_stream: {
        Args: { p_name: string; p_strategy: string; p_settings?: Json }
        Returns: string
      }
      start_immediate_revenue_process: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      stop_autonomous_revenue_stream: {
        Args: { p_stream_id: string }
        Returns: boolean
      }
      track_optimization: {
        Args: {
          p_stream_id: string
          p_optimization_type: string
          p_previous_value: Json
          p_new_value: Json
        }
        Returns: string
      }
      transfer_revenue_to_stripe: {
        Args: Record<PropertyKey, never> | { p_amount?: number }
        Returns: Json
      }
      trigger_immediate_revenue_consolidation: {
        Args: { p_days_back?: number }
        Returns: Json
      }
      trigger_revenue_transfer: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      update_revenue_stream_metrics: {
        Args: { p_stream_id: string; p_amount: number }
        Returns: undefined
      }
      update_revenue_transfer_schedule: {
        Args: { p_frequency?: string }
        Returns: Json
      }
      update_user_wallet: {
        Args: { p_user_id: string; p_amount: number }
        Returns: Json
      }
      update_wallet_balance: {
        Args: { wallet_id: string; amount: number }
        Returns: number
      }
      update_wallet_balance_v2: {
        Args: { wallet_id: string; amount: number }
        Returns: number
      }
      withdraw_funds_to_bank: {
        Args: { p_amount: number; p_description?: string }
        Returns: Json
      }
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
