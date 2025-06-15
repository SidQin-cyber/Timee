import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // 不需要用户认证，禁用会话持久化
  },
  realtime: {
    params: {
      eventsPerSecond: 10, // 限制实时事件频率
    },
  },
})

// 数据库类型定义
export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          timezone: string
          start_date: string
          end_date: string
          start_time: string
          end_time: string
          event_type: 'group' | 'one-on-one'
          include_time: boolean
          finalized_slots: string[] | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          title: string
          description?: string | null
          timezone: string
          start_date: string
          end_date: string
          start_time: string
          end_time: string
          event_type: 'group' | 'one-on-one'
          include_time?: boolean
          finalized_slots?: string[] | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          timezone?: string
          start_date?: string
          end_date?: string
          start_time?: string
          end_time?: string
          event_type?: 'group' | 'one-on-one'
          include_time?: boolean
          finalized_slots?: string[] | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      event_responses: {
        Row: {
          id: string
          event_id: string
          participant_name: string
          participant_email: string | null
          user_initials: string
          paint_mode: 'available' | 'unavailable'
          timezone: string
          available_slots: any[] // JSON array
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          participant_name: string
          participant_email?: string | null
          user_initials: string
          paint_mode: 'available' | 'unavailable'
          timezone: string
          available_slots: any[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          participant_name?: string
          participant_email?: string | null
          user_initials?: string
          paint_mode?: 'available' | 'unavailable'
          timezone?: string
          available_slots?: any[]
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 