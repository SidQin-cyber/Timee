import { supabase } from '@/lib/supabase'
import type { TimeSlot } from '@/types'

export interface UserResponse {
  id: string
  eventId: string
  participantName: string
  participantEmail?: string
  userInitials: string
  paintMode: 'available' | 'unavailable'
  timezone: string
  availability: TimeSlot[]
  submittedAt: string
}

export interface CreateResponseData {
  eventId: string
  participantName: string
  participantEmail?: string
  userInitials: string
  paintMode: 'available' | 'unavailable'
  timezone: string
  availableSlots: TimeSlot[]
}

export class ResponseService {
  /**
   * 提交用户响应
   */
  static async submitResponse(data: CreateResponseData): Promise<void> {
    const { error } = await supabase
      .from('event_responses')
      .upsert({
        event_id: data.eventId,
        participant_name: data.participantName,
        participant_email: data.participantEmail || null,
        user_initials: data.userInitials,
        paint_mode: data.paintMode,
        timezone: data.timezone,
        available_slots: data.availableSlots,
      }, {
        onConflict: 'event_id,participant_name' // 如果同名用户已存在，则更新
      })

    if (error) {
      console.error('Failed to submit response:', error)
      throw new Error(`提交响应失败: ${error.message}`)
    }
  }

  /**
   * 获取事件的所有用户响应
   */
  static async getEventResponses(eventId: string): Promise<UserResponse[]> {
    const { data, error } = await supabase
      .from('event_responses')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Failed to get event responses:', error)
      throw new Error(`获取响应失败: ${error.message}`)
    }

    return (data || []).map(item => ({
      id: item.id,
      eventId: item.event_id,
      participantName: item.participant_name,
      participantEmail: item.participant_email || undefined,
      userInitials: item.user_initials,
      paintMode: item.paint_mode,
      timezone: item.timezone,
      availability: item.available_slots || [],
      submittedAt: item.created_at,
    }))
  }

  /**
   * 获取特定用户的响应
   */
  static async getUserResponse(eventId: string, participantName: string): Promise<UserResponse | null> {
    const { data, error } = await supabase
      .from('event_responses')
      .select('*')
      .eq('event_id', eventId)
      .eq('participant_name', participantName)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // 记录未找到
        return null
      }
      console.error('Failed to get user response:', error)
      throw new Error(`获取用户响应失败: ${error.message}`)
    }

    if (!data) return null

    return {
      id: data.id,
      eventId: data.event_id,
      participantName: data.participant_name,
      participantEmail: data.participant_email || undefined,
      userInitials: data.user_initials,
      paintMode: data.paint_mode,
      timezone: data.timezone,
      availability: data.available_slots || [],
      submittedAt: data.created_at,
    }
  }

  /**
   * 删除用户响应
   */
  static async deleteResponse(eventId: string, participantName: string): Promise<void> {
    const { error } = await supabase
      .from('event_responses')
      .delete()
      .eq('event_id', eventId)
      .eq('participant_name', participantName)

    if (error) {
      console.error('Failed to delete response:', error)
      throw new Error(`删除响应失败: ${error.message}`)
    }
  }

  /**
   * 订阅事件响应的实时更新
   */
  static subscribeToEventResponses(
    eventId: string, 
    callback: (responses: UserResponse[]) => void
  ) {
    const channel = supabase
      .channel(`event-responses-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // 监听所有变化（INSERT, UPDATE, DELETE）
          schema: 'public',
          table: 'event_responses',
          filter: `event_id=eq.${eventId}`,
        },
        async () => {
          // 当有变化时，重新获取所有响应
          try {
            const responses = await ResponseService.getEventResponses(eventId)
            callback(responses)
          } catch (error) {
            console.error('Failed to fetch updated responses:', error)
          }
        }
      )
      .subscribe()

    // 返回取消订阅的函数
    return () => {
      supabase.removeChannel(channel)
    }
  }

  /**
   * 获取事件的参与者统计
   */
  static async getEventStats(eventId: string): Promise<{
    totalParticipants: number
    responseCount: number
    lastUpdated: string | null
  }> {
    const { data, error } = await supabase
      .from('event_responses')
      .select('created_at, updated_at')
      .eq('event_id', eventId)

    if (error) {
      console.error('Failed to get event stats:', error)
      return {
        totalParticipants: 0,
        responseCount: 0,
        lastUpdated: null
      }
    }

    const responses = data || []
    const lastUpdated = responses.length > 0 
      ? Math.max(...responses.map(r => new Date(r.updated_at).getTime()))
      : null

    return {
      totalParticipants: responses.length,
      responseCount: responses.length,
      lastUpdated: lastUpdated ? new Date(lastUpdated).toISOString() : null
    }
  }
} 