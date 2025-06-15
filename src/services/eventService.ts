import { supabase } from '@/lib/supabase'
import type { Event } from '@/types'

export interface CreateEventData {
  title: string
  description: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  timezone: string
  eventType: 'group' | 'one-on-one'
  includeTime: boolean
  selectedDates?: string[] // 用户选择的具体日期列表
  customTCode?: string // 可选的自定义T-Code
}

export class EventService {
  /**
   * 生成唯一的T-Code
   */
  private static generateTCode(): string {
    // 生成6位随机数字
    const randomNum = Math.floor(100000 + Math.random() * 900000)
    return `tc-${randomNum}`
  }

  /**
   * 创建新事件
   */
  static async createEvent(data: CreateEventData): Promise<string> {
    try {
      const tCode = data.customTCode || this.generateTCode()
      
      const eventData = {
        id: tCode,
        title: data.title,
        description: data.description,
        start_date: data.startDate,
        end_date: data.endDate,
        start_time: data.startTime,
        end_time: data.endTime,
        timezone: data.timezone,
        event_type: data.eventType,
        include_time: data.includeTime,
        selected_dates: data.selectedDates ? JSON.stringify(data.selectedDates) : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: result, error } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single()

      if (error) {
        console.error('创建活动失败:', error)
        throw new Error(`创建活动失败: ${error.message}`)
      }

      return result.id
    } catch (error) {
      console.error('EventService.createEvent 错误:', error)
      throw error
    }
  }

  /**
   * 根据ID获取事件
   */
  static async getEvent(eventId: string): Promise<Event | null> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // 记录未找到
          return null
        }
        
        // 其他数据库错误
        console.error('Database error in getEvent:', error)
        throw new Error(`数据库查询失败: ${error.message}`)
      }

      if (!data) return null

      // 转换数据库格式到应用格式
      return {
        id: data.id,
        title: data.title,
        description: data.description || '',
        timezone: data.timezone,
        startDate: data.start_date,
        endDate: data.end_date,
        startTime: data.start_time,
        endTime: data.end_time,
        eventType: data.event_type,
        includeTime: data.include_time,
        selectedDates: data.selected_dates ? JSON.parse(data.selected_dates) : undefined,
        finalizedSlots: data.finalized_slots || [],
        createdBy: data.created_by || '',
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
    } catch (error) {
      // 网络错误或其他未预期的错误
      if (error instanceof Error && error.message.includes('数据库查询失败')) {
        throw error // 重新抛出数据库错误
      }
      
      console.error('Network or unexpected error in getEvent:', error)
      throw new Error('网络连接失败，请检查网络连接后重试')
    }
  }

  /**
   * 更新事件
   */
  static async updateEvent(eventId: string, updates: Partial<CreateEventData>): Promise<void> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      }

      if (updates.title !== undefined) updateData.title = updates.title
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.timezone !== undefined) updateData.timezone = updates.timezone
      if (updates.startDate !== undefined) updateData.start_date = updates.startDate
      if (updates.endDate !== undefined) updateData.end_date = updates.endDate
      if (updates.startTime !== undefined) updateData.start_time = updates.startTime
      if (updates.endTime !== undefined) updateData.end_time = updates.endTime
      if (updates.eventType !== undefined) updateData.event_type = updates.eventType
      if (updates.includeTime !== undefined) updateData.include_time = updates.includeTime
      if (updates.selectedDates !== undefined) updateData.selected_dates = JSON.stringify(updates.selectedDates)

      const { error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', eventId)

      if (error) {
        console.error('Failed to update event:', error)
        throw new Error(`更新事件失败: ${error.message}`)
      }
    } catch (error) {
      console.error('EventService.updateEvent 错误:', error)
      throw error
    }
  }

  /**
   * 删除事件
   */
  static async deleteEvent(eventId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

      if (error) {
        console.error('Failed to delete event:', error)
        throw new Error(`删除事件失败: ${error.message}`)
      }
    } catch (error) {
      console.error('EventService.deleteEvent 错误:', error)
      throw error
    }
  }

  /**
   * 获取最近创建的事件列表
   */
  static async getRecentEvents(limit: number = 10): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Failed to get recent events:', error)
      throw new Error(`获取事件列表失败: ${error.message}`)
    }

    return (data || []).map(item => ({
      id: item.id,
      title: item.title,
      description: item.description || '',
      timezone: item.timezone,
      startDate: item.start_date,
      endDate: item.end_date,
      startTime: item.start_time,
      endTime: item.end_time,
      eventType: item.event_type,
      includeTime: item.include_time,
      finalizedSlots: item.finalized_slots || [],
      createdBy: item.created_by || '',
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }))
  }
} 