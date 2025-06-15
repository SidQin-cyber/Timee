import { create } from 'zustand'
import type { Event, TimeSlot } from '@/types'
import { EventService, type CreateEventData } from '@/services/eventService'
import { ResponseService, type UserResponse as ServiceUserResponse, type CreateResponseData } from '@/services/responseService'

interface EventFormData {
  title: string
  description: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  timezone: string
  eventType: 'group' | 'one-on-one'
  includeTime: boolean
}

// 用户响应数据（已提交到后端的数据）
interface UserResponse {
  userId: string           // 唯一用户标识
  userName: string         // 用户显示名称
  userInitials: string     // 用户首字母
  availability: TimeSlot[] // 用户选择的时间段
  paintMode: 'available' | 'unavailable'
  timezone: string         // 用户时区
  submittedAt: string      // 提交时间
}

// 当前用户的本地状态（未提交的数据）
interface CurrentUserState {
  userId: string
  userName: string
  userInitials: string
  timezone: string
  paintMode: 'available' | 'unavailable'
  localSelection: TimeSlot[]  // 本地选择，实时更新
  hasUnsavedChanges: boolean  // 是否有未保存的更改
  isSubmitting: boolean       // 是否正在提交
}



// 热力图数据（前端计算）
interface HeatmapData {
  [key: string]: {
    count: number           // 选择该时段的总人数
    userNames: string[]     // 选择该时段的用户名列表
  }
}

interface EventStore {
  // State
  events: Event[]
  currentEvent: Event | null
  userResponses: UserResponse[]        // 其他用户的已提交响应
  currentUser: CurrentUserState | null // 当前用户状态
  heatmapData: HeatmapData            // 计算后的热力图数据
  isLoading: boolean
  error: string | null
  lastDataFetch: number               // 最后一次数据获取时间
  realtimeSubscription: (() => void) | null // 实时订阅取消函数

  // Actions
  createEvent: (data: EventFormData) => Promise<string>
  loadEventData: (id: string) => Promise<void>           // 加载事件和所有响应
  refreshUserResponses: (eventId: string) => Promise<void> // 刷新其他用户响应
  initCurrentUser: (userName: string, timezone: string) => void // 初始化当前用户
  updateLocalSelection: (selection: TimeSlot[], paintMode?: 'available' | 'unavailable') => void   // 更新本地选择
  submitCurrentUser: (eventId: string) => Promise<void>   // 提交当前用户选择
  calculateHeatmap: () => void                           // 计算热力图
  getHeatmapIntensity: (dateIndex: number, timeIndex: number) => number
  getHeatmapDetails: (dateIndex: number, timeIndex: number) => { count: number, userNames: string[], totalParticipants: number }
  clearError: () => void
  setLoading: (loading: boolean) => void
  subscribeToRealtime: (eventId: string) => void         // 订阅实时更新
  unsubscribeFromRealtime: () => void                    // 取消实时订阅
}

// 工具函数：生成唯一用户ID
const generateUserId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 工具函数：转换服务响应到store格式
const convertServiceResponseToStore = (serviceResponse: ServiceUserResponse): UserResponse => {
  return {
    userId: serviceResponse.id,
    userName: serviceResponse.participantName,
    userInitials: serviceResponse.userInitials,
    availability: serviceResponse.availability,
    paintMode: serviceResponse.paintMode,
    timezone: serviceResponse.timezone,
    submittedAt: serviceResponse.submittedAt,
  }
}

// 工具函数：计算热力图数据
const calculateHeatmapData = (
  userResponses: UserResponse[], 
  currentUser: CurrentUserState | null,
  currentEvent: Event | null
): HeatmapData => {
  const heatmap: HeatmapData = {}
  
  // 如果没有事件信息，无法计算完整的时间网格
  if (!currentEvent) {
    return heatmap
  }
  
  // 计算事件的完整时间网格
  const getEventTimeGrid = (event: Event) => {
    const slots: { dateIndex: number, timeIndex: number }[] = []
    const startDate = new Date(event.startDate)
    const endDate = new Date(event.endDate)
    
    if (!event.includeTime) {
      // 仅日期模式：每个日期只有一个时间段（timeIndex: 0）
      const currentDate = new Date(startDate)
      let dateIndex = 0
      
      while (currentDate <= endDate) {
        slots.push({ dateIndex, timeIndex: 0 })
        currentDate.setDate(currentDate.getDate() + 1)
        dateIndex++
      }
    } else {
      // 包含时间模式：计算完整的时间网格
      const [startHour, startMinute] = event.startTime.split(':').map(Number)
      const [endHour, endMinute] = event.endTime.split(':').map(Number)
      
      // 计算日期范围
      const currentDate = new Date(startDate)
      let dateIndex = 0
      
      while (currentDate <= endDate) {
        // 计算时间范围（每30分钟一个时段）
        let timeIndex = 0
        for (let hour = startHour; hour < endHour || (hour === endHour && startMinute === 0); hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            if (hour === endHour && minute >= endMinute) break
            if (hour === startHour && minute < startMinute) continue
            
            slots.push({ dateIndex, timeIndex })
            timeIndex++
          }
        }
        
        currentDate.setDate(currentDate.getDate() + 1)
        dateIndex++
      }
    }
    
    return slots
  }
  
  const allTimeSlots = getEventTimeGrid(currentEvent)
  
  // 首先初始化所有时间段的热力图条目为0
  allTimeSlots.forEach(slot => {
    const key = `${slot.dateIndex}-${slot.timeIndex}`
    heatmap[key] = { count: 0, userNames: [] }
  })
  
  // 收集所有用户（包括当前用户）
  const allUsers: Array<{
    userName: string
    paintMode: 'available' | 'unavailable'
    availability: TimeSlot[]
  }> = []
  
  // 添加已提交的用户响应
  userResponses.forEach(response => {
    allUsers.push({
      userName: response.userName,
      paintMode: response.paintMode,
      availability: response.availability
    })
  })
  
  // 添加当前用户的本地选择（如果存在且还未提交）
  if (currentUser && currentUser.localSelection.length > 0) {
    const currentUserAlreadySubmitted = userResponses.some(
      response => response.userName === currentUser.userName
    )
    
    if (!currentUserAlreadySubmitted) {
      allUsers.push({
        userName: currentUser.userName,
        paintMode: currentUser.paintMode,
        availability: currentUser.localSelection
      })
    }
  }
  
  // 处理每个用户的可用性
  allUsers.forEach(user => {
    if (user.paintMode === 'available') {
      // 可行时间模式：只统计选中的时间段
      user.availability.forEach(slot => {
        const key = `${slot.dateIndex}-${slot.timeIndex}`
        if (heatmap[key] && !heatmap[key].userNames.includes(user.userName)) {
          heatmap[key].count++
          heatmap[key].userNames.push(user.userName)
        }
      })
    } else if (user.paintMode === 'unavailable') {
      // 不可行时间模式：统计所有未选中的时间段（即可行时间）
      if (!currentEvent.includeTime) {
        // 仅日期模式：处理整个日期的可用性
        const unavailableDates = new Set(
          user.availability.map(slot => slot.dateIndex)
        )
        
        // 对于每个日期，如果没有被标记为不可行，则认为是可行的
        allTimeSlots.forEach(slot => {
          const key = `${slot.dateIndex}-${slot.timeIndex}`
          if (!unavailableDates.has(slot.dateIndex)) {
            if (heatmap[key] && !heatmap[key].userNames.includes(user.userName)) {
              heatmap[key].count++
              heatmap[key].userNames.push(user.userName)
            }
          }
        })
      } else {
        // 包含时间模式：处理具体的时间段
        const unavailableSlots = new Set(
          user.availability.map(slot => `${slot.dateIndex}-${slot.timeIndex}`)
        )
        
        // 对于整个事件时间范围内的每个时间段
        allTimeSlots.forEach(slot => {
          const key = `${slot.dateIndex}-${slot.timeIndex}`
          // 如果这个时间段没有被标记为不可行，则认为是可行的
          if (!unavailableSlots.has(key)) {
            if (heatmap[key] && !heatmap[key].userNames.includes(user.userName)) {
              heatmap[key].count++
              heatmap[key].userNames.push(user.userName)
            }
          }
        })
      }
    }
  })
  
  return heatmap
}

export const useEventStore = create<EventStore>((set, get) => ({
  // Initial state
  events: [],
  currentEvent: null,
  userResponses: [],
  currentUser: null,
  heatmapData: {},
  isLoading: false,
  error: null,
  lastDataFetch: 0,
  realtimeSubscription: null,

  // Actions
  createEvent: async (data: EventFormData): Promise<string> => {
    set({ isLoading: true, error: null })
    
    try {
      console.log('Creating event with Supabase:', data)
      
      const createData: CreateEventData = {
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        startTime: data.startTime,
        endTime: data.endTime,
        timezone: data.timezone,
        eventType: data.eventType,
        includeTime: data.includeTime,
      }
      
      const eventId = await EventService.createEvent(createData)
      
      // 获取创建的事件
      const newEvent = await EventService.getEvent(eventId)
      
      if (newEvent) {
        set(state => ({
          events: [...state.events, newEvent],
          currentEvent: newEvent,
          isLoading: false
        }))
      }
      
      console.log('Event created successfully:', eventId)
      return eventId
      
    } catch (error) {
      console.error('Failed to create event:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create event'
      set({ 
        error: errorMessage,
        isLoading: false 
      })
      throw error
    }
  },

  loadEventData: async (id: string): Promise<void> => {
    set({ isLoading: true, error: null })
    
    try {
      console.log('Loading event data from Supabase:', id)
      
      // 并行加载事件和响应数据
      const [event, responses] = await Promise.all([
        EventService.getEvent(id),
        ResponseService.getEventResponses(id)
      ])
      
      if (!event) {
        throw new Error('Event not found')
      }
      
      const userResponses = responses.map(convertServiceResponseToStore)
      const heatmapData = calculateHeatmapData(userResponses, get().currentUser, event)
      
      set({
        currentEvent: event,
        userResponses,
        heatmapData,
        isLoading: false,
        lastDataFetch: Date.now()
      })
      
      // 订阅实时更新
      get().subscribeToRealtime(id)
      
      console.log('Event data loaded successfully:', { eventId: id, responsesCount: responses.length })
      
    } catch (error) {
      console.error('Failed to load event data:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to load event data'
      set({ 
        error: errorMessage,
        isLoading: false 
      })
    }
  },

  refreshUserResponses: async (eventId: string): Promise<void> => {
    try {
      console.log('Refreshing user responses:', eventId)
      
      const responses = await ResponseService.getEventResponses(eventId)
      const userResponses = responses.map(convertServiceResponseToStore)
      const heatmapData = calculateHeatmapData(userResponses, get().currentUser, get().currentEvent)
      
      set({
        userResponses,
        heatmapData,
        lastDataFetch: Date.now()
      })
      
      console.log('User responses refreshed:', { responsesCount: responses.length })
      
    } catch (error) {
      console.error('Failed to refresh user responses:', error)
    }
  },

  initCurrentUser: (userName: string, timezone: string) => {
    const userId = generateUserId()
    const userInitials = userName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2)
    
    const currentUser: CurrentUserState = {
      userId,
      userName,
      userInitials,
      timezone,
      paintMode: 'available',
      localSelection: [],
      hasUnsavedChanges: false,
      isSubmitting: false,
    }
    
    set({ currentUser })
    
    // 重新计算热力图
    const { userResponses } = get()
    const heatmapData = calculateHeatmapData(userResponses, currentUser, get().currentEvent)
    set({ heatmapData })
    
    console.log('Current user initialized:', { userId, userName, timezone })
  },

  updateLocalSelection: (selection: TimeSlot[], paintMode?: 'available' | 'unavailable') => {
    const { currentUser } = get()
    if (!currentUser) return
    
    const updatedUser: CurrentUserState = {
      ...currentUser,
      localSelection: selection,
      paintMode: paintMode || currentUser.paintMode,
      hasUnsavedChanges: true,
    }
    
    set({ currentUser: updatedUser })
    
    // 重新计算热力图
    const { userResponses } = get()
    const heatmapData = calculateHeatmapData(userResponses, updatedUser, get().currentEvent)
    set({ heatmapData })
  },

  submitCurrentUser: async (eventId: string): Promise<void> => {
    const { currentUser } = get()
    if (!currentUser || currentUser.isSubmitting) return
    
    try {
      // 设置提交状态
      set({
        currentUser: {
          ...currentUser,
          isSubmitting: true,
        }
      })
      
      console.log('Submitting user response to Supabase:', {
        eventId,
        userName: currentUser.userName,
        slotsCount: currentUser.localSelection.length
      })
      
      const responseData: CreateResponseData = {
        eventId,
        participantName: currentUser.userName,
        userInitials: currentUser.userInitials,
        paintMode: currentUser.paintMode,
        timezone: currentUser.timezone,
        availableSlots: currentUser.localSelection,
      }
      
      await ResponseService.submitResponse(responseData)
      
      // 提交成功后，清除本地状态
      set({
        currentUser: {
          ...currentUser,
          hasUnsavedChanges: false,
          isSubmitting: false,
        }
      })
      
      // 刷新响应数据
      await get().refreshUserResponses(eventId)
      
      console.log('User response submitted successfully')
      
    } catch (error) {
      console.error('Failed to submit user response:', error)
      
      // 恢复提交状态
      set({
        currentUser: currentUser ? {
          ...currentUser,
          isSubmitting: false,
        } : null
      })
      
      throw error
    }
  },

  calculateHeatmap: () => {
    const { userResponses, currentUser } = get()
    const heatmapData = calculateHeatmapData(userResponses, currentUser, get().currentEvent)
    set({ heatmapData })
  },

  getHeatmapIntensity: (dateIndex: number, timeIndex: number): number => {
    const { heatmapData, userResponses } = get()
    const key = `${dateIndex}-${timeIndex}`
    const slotData = heatmapData[key]
    
    if (!slotData) return 0
    
    // 团队热力图只计算已提交的用户
    const totalParticipants = userResponses.length
    if (totalParticipants === 0) return 0
    
    return slotData.count / totalParticipants
  },

  getHeatmapDetails: (dateIndex: number, timeIndex: number) => {
    const { heatmapData, userResponses } = get()
    const key = `${dateIndex}-${timeIndex}`
    const slotData = heatmapData[key]
    
    // 团队热力图只计算已提交的用户
    const totalParticipants = userResponses.length
    
    if (!slotData) {
      return {
        count: 0,
        userNames: [],
        totalParticipants
      }
    }
    
    return {
      count: slotData.count,
      userNames: slotData.userNames,
      totalParticipants
    }
  },

  subscribeToRealtime: (eventId: string) => {
    // 先取消之前的订阅
    get().unsubscribeFromRealtime()
    
    console.log('Subscribing to realtime updates for event:', eventId)
    
    const unsubscribe = ResponseService.subscribeToEventResponses(
      eventId,
      (responses) => {
        console.log('Received realtime update:', { responsesCount: responses.length })
        
        const userResponses = responses.map(convertServiceResponseToStore)
        const heatmapData = calculateHeatmapData(userResponses, get().currentUser, get().currentEvent)
        
        set({
          userResponses,
          heatmapData,
          lastDataFetch: Date.now()
        })
      }
    )
    
    set({ realtimeSubscription: unsubscribe })
  },

  unsubscribeFromRealtime: () => {
    const { realtimeSubscription } = get()
    if (realtimeSubscription) {
      console.log('Unsubscribing from realtime updates')
      realtimeSubscription()
      set({ realtimeSubscription: null })
    }
  },

  clearError: () => set({ error: null }),
  
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}))

// 导出类型
export type { UserResponse, CurrentUserState, TimeSlot } 