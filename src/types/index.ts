// Event types
export interface Event {
  id: string
  title: string
  description?: string
  timezone: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  eventType: 'group' | 'one-on-one'
  includeTime?: boolean // 是否包含具体时间选择
  selectedDates?: string[] // 用户选择的具体日期列表 (YYYY-MM-DD格式)
  finalizedSlots?: string[]
  createdBy?: string
  createdAt: string
  updatedAt: string
}

// Response types
export interface EventResponse {
  id: string
  eventId: string
  participantName: string
  participantEmail?: string
  availableSlots: string[]
  createdAt: string
  updatedAt: string
}

// User types
export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  calendarAccounts?: string[]
}

// UI types
export interface TimeSlot {
  date: string
  time: string
  dateIndex: number
  timeIndex: number
  type?: 'available' | 'unavailable'
  utcTimestamp?: string // UTC时间戳，用于时区转换
  originalTimezone?: string // 用户选择时的时区
  // 兼容旧版本的字段
  isAvailable?: boolean
  participantCount?: number
  participants?: string[]
}

export interface SidebarState {
  isOpen: boolean
  isCollapsed: boolean
} 