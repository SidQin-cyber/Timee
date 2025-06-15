import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import Loader from '@/components/ui/loader'
import { useEventStore, type TimeSlot } from '@/store/useEventStore'
import { useTimeGrid } from '@/hooks/useTimeGrid'
import { DateOnlySelector } from '@/components/DateOnlySelector'
import { DateHeatmap } from '@/components/DateHeatmap'
import { cn } from '@/lib/utils'
import { Copy, Check, User } from 'lucide-react'
import { 
  generateTimezoneAwareTimeSlots, 
  getUserTimezone,
  convertToUTC
} from '@/utils/timezone'
import type { Event } from '@/types'

export const EventPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>()
  
  // 使用新的store结构
  const { 
    currentEvent, 
    userResponses, 
    currentUser,
    isLoading, 
    error, 
    loadEventData, 
    refreshUserResponses,
    initCurrentUser,
    updateLocalSelection,
    submitCurrentUser,
    getHeatmapDetails
  } = useEventStore()

  // 本地UI状态
  const [copied, setCopied] = useState(false)
  const [hoveredSlot, setHoveredSlot] = useState<{ dateIndex: number; timeIndex: number } | null>(null)
  const [dragDateInfo, setDragDateInfo] = useState<{ dateIndex: number; dateStr: string; weekday: string; formattedDate: string } | null>(null)
  const [userTimezone, setUserTimezone] = useState(() => getUserTimezone())
  const [showSignIn, setShowSignIn] = useState(true)
  const [tempUserName, setTempUserName] = useState('')
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null)
  
  // 仅日期模式的本地状态
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)

  // 生成日期列表
  const generateDates = (event: Event): string[] => {
    // 如果事件有selectedDates字段，使用具体的选择日期
    if (event.selectedDates && event.selectedDates.length > 0) {
      return event.selectedDates.map((dateStr: string) => {
        const date = new Date(dateStr)
        return `${date.getMonth() + 1}/${date.getDate()}`
      }).sort((a: string, b: string) => {
        // 按日期排序
        const [monthA, dayA] = a.split('/').map(Number)
        const [monthB, dayB] = b.split('/').map(Number)
        const dateA = new Date(new Date().getFullYear(), monthA - 1, dayA)
        const dateB = new Date(new Date().getFullYear(), monthB - 1, dayB)
        return dateA.getTime() - dateB.getTime()
      })
    }
    
    // 回退到连续日期范围生成（兼容旧数据）
    const dates = []
    const start = new Date(event.startDate)
    const end = new Date(event.endDate)
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(`${d.getMonth() + 1}/${d.getDate()}`)
    }
    return dates
  }

  // 格式化日期显示 - 返回星期和日期
  const formatDateDisplay = (dateStr: string) => {
    const [month, day] = dateStr.split('/').map(Number)
    const year = new Date().getFullYear()
    const dateObj = new Date(year, month - 1, day)
    
    // 英文星期缩写
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const weekday = weekdays[dateObj.getDay()]
    
    // 日.月格式
    const formattedDate = `${month}.${day}`
    
    return { weekday, formattedDate }
  }

  // 获取完整的日期信息（用于拖拽提示）
  const getFullDateInfo = (dateStr: string) => {
    const [month, day] = dateStr.split('/').map(Number)
    const year = new Date().getFullYear()
    const dateObj = new Date(year, month - 1, day)
    
    // 中文星期
    const chineseWeekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    const chineseWeekday = chineseWeekdays[dateObj.getDay()]
    
    // 英文星期缩写
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const weekday = weekdays[dateObj.getDay()]
    
    return {
      month,
      day,
      weekday,
      chineseWeekday,
      formattedDate: `${month}月${day}日`
    }
  }
  
  // 生成时区感知的时间列表 (每15分钟一个时段)
  const generateTimeSlots = (startTime: string, endTime: string): string[] => {
    if (!currentEvent) return []
    
    // 使用时区感知的时间段生成
    return generateTimezoneAwareTimeSlots(
      startTime,
      endTime,
      currentEvent.timezone,
      userTimezone,
      dates[0] || '1/1' // 使用第一个日期作为基准
    )
  }

  // 为Hook提供默认值，避免条件调用
  const dates = currentEvent ? generateDates(currentEvent) : []
  const timeSlots = currentEvent ? generateTimeSlots(currentEvent.startTime, currentEvent.endTime) : []

  // 防抖保存的引用
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 当前用户的本地选择状态（用于UI显示）
  const currentUserSelection = useMemo(() => {
    return currentUser?.localSelection || []
  }, [currentUser?.localSelection])

  // 仅日期模式：当前用户选择的日期集合
  const selectedDates = useMemo(() => {
    if (!currentEvent?.includeTime && currentUserSelection.length > 0) {
      return new Set(currentUserSelection.map(slot => slot.date))
    }
    return new Set<string>()
  }, [currentEvent?.includeTime, currentUserSelection])

  // 处理选择变化 - 实时UI更新，防抖保存
  const handleSelectionChange = useCallback((selectedSlots: TimeSlot[]) => {
    if (!currentUser) return
    
    // 将选择的时间段转换为时区感知的格式
    const timezoneAwareSlots = selectedSlots.map(slot => {
      const utcTimestamp = convertToUTC(slot.date, slot.time, userTimezone)
      return {
        ...slot,
        utcTimestamp,
        originalTimezone: userTimezone
      }
    })
    
    // 立即更新本地选择状态（实时UI更新）
    updateLocalSelection(timezoneAwareSlots)
    
    // 清除之前的保存定时器
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    // 设置新的保存定时器（300ms防抖）
    if (eventId) {
      saveTimeoutRef.current = setTimeout(() => {
        submitCurrentUser(eventId).catch(error => {
          console.error('保存失败:', error)
          // 这里可以添加用户友好的错误提示，但不阻塞UI
        })
      }, 300)
    }
  }, [currentUser, updateLocalSelection, submitCurrentUser, eventId, userTimezone])

  // 仅日期模式：处理日期切换
  const handleDateToggle = useCallback((date: string) => {
    if (!currentUser) return
    
    const newSelectedDates = new Set(selectedDates)
    if (newSelectedDates.has(date)) {
      newSelectedDates.delete(date)
    } else {
      newSelectedDates.add(date)
    }
    
    // 转换为TimeSlot格式
    const dateSlots: TimeSlot[] = Array.from(newSelectedDates).map(dateStr => ({
      date: dateStr,
      time: '00:00', // 仅日期模式使用默认时间
      dateIndex: dates.indexOf(dateStr),
      timeIndex: 0,
      type: currentUser.paintMode === 'available' ? 'available' : 'unavailable'
    }))
    
    // 立即更新本地选择状态
    updateLocalSelection(dateSlots)
    
    // 清除之前的保存定时器
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    // 设置新的保存定时器
    if (eventId) {
      saveTimeoutRef.current = setTimeout(() => {
        submitCurrentUser(eventId).catch(error => {
          console.error('保存失败:', error)
        })
      }, 300)
    }
  }, [currentUser, selectedDates, dates, updateLocalSelection, submitCurrentUser, eventId])



  // 仅日期模式：获取日期详细信息
  const getDateDetails = useCallback((date: string) => {
    const dateIndex = dates.indexOf(date)
    if (dateIndex === -1) return { count: 0, totalParticipants: 0 }
    
    return getHeatmapDetails(dateIndex, 0)
  }, [dates, getHeatmapDetails])

  // 清理定时器
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  // 初始化时间网格Hook
  const timeGrid = useTimeGrid({
    dates,
    timeSlots,
    onSelectionChange: handleSelectionChange,
    paintMode: currentUser?.paintMode || 'available'
  })



  // 加载事件数据
  useEffect(() => {
    if (eventId) {
      loadEventData(eventId)
    }
  }, [eventId, loadEventData])

  // 定期刷新其他用户的响应数据（仿照schej.it的轮询机制）
  useEffect(() => {
    if (!eventId || showSignIn) return

    const interval = setInterval(() => {
      refreshUserResponses(eventId)
    }, 5000) // 每5秒刷新一次

    return () => clearInterval(interval)
  }, [eventId, showSignIn, refreshUserResponses])

  // 初始化当前用户
  useEffect(() => {
    // 检查本地存储中是否有保存的用户名
    const savedName = localStorage.getItem(`participant-name-${eventId}`)
    if (savedName && !currentUser) {
      initCurrentUser(savedName, userTimezone)
      setShowSignIn(false)
    }
  }, [eventId, currentUser, userTimezone, initCurrentUser])

  // 处理全局指针松开事件
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      timeGrid.handleGlobalPointerUp()
    }
    
    document.addEventListener('pointerup', handleGlobalPointerUp)
    return () => {
      document.removeEventListener('pointerup', handleGlobalPointerUp)
    }
  }, [timeGrid.handleGlobalPointerUp])

  // 复制活动链接
  const handleCopyLink = async () => {
    try {
      const url = window.location.href
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 加载状态
  if (isLoading) {
    return (
      <div className="fixed inset-0 lg:left-52 flex items-center justify-center bg-background/80 backdrop-blur-sm z-40">
        <div className="text-center space-y-4">
          <Loader />
        </div>
      </div>
    )
  }

  // 错误状态
  if (error || !currentEvent) {
    return (
      <div className="fixed inset-0 lg:left-52 flex items-center justify-center bg-background/80 backdrop-blur-sm z-40">
        <div className="text-center space-y-4">
          <div className="text-6xl">😕</div>
          <h2 className="text-2xl font-semibold">活动未找到</h2>
          <p className="text-muted-foreground">
            {error || '请检查活动链接是否正确'}
          </p>
        </div>
      </div>
    )
  }

  // 获取单元格状态 - 左栏只显示用户选择，不显示热力图
  const getCellState = (dateIndex: number, timeIndex: number): string => {
    if (timeGrid.isSlotSelected(dateIndex, timeIndex)) {
      const slotType = timeGrid.getSlotType(dateIndex, timeIndex)
      return slotType || 'available' // 默认为available
    }
    
    // 左栏用户操作界面：未选择时只显示默认状态，不显示热力图
    return 'default'
  }

  // 智能时间段提取：找到完整的连续时间块
  const getIntelligentTimeBlock = (dateIndex: number, timeIndex: number) => {
    if (!currentEvent?.includeTime) return null
    
    // 获取当前时段的热力图详情
    const currentHeatmapDetails = getHeatmapDetails(dateIndex, timeIndex)
    const { userNames: currentAvailableUsers } = currentHeatmapDetails
    
    // 获取所有参与者列表
    const allParticipants = new Set<string>()
    userResponses.forEach(response => {
      allParticipants.add(response.userName)
    })
    if (currentUser) {
      const currentUserAlreadySubmitted = userResponses.some(
        response => response.userName === currentUser.userName
      )
      if (!currentUserAlreadySubmitted) {
        allParticipants.add(currentUser.userName)
      }
    }
    
    // 计算不可行用户
    const unavailableUsers: string[] = []
    allParticipants.forEach(userName => {
      if (!currentAvailableUsers.includes(userName)) {
        unavailableUsers.push(userName)
      }
    })
    
    // 如果没有用户可行，返回基础信息（显示时间和不可行用户，但不做时间段扩展）
    if (currentAvailableUsers.length === 0) {
      return {
        dateIndex,
        startTimeIndex: timeIndex,
        endTimeIndex: timeIndex,
        availableUsers: [],
        unavailableUsers,
        blockType: 'no-availability' as const,
        showBasicTimeOnly: true // 不扩展时间段，只显示当前时间点
      }
    }
    
    // 如果只有一个用户，找到该用户的完整连续时间段
    if (currentAvailableUsers.length === 1) {
      const userName = currentAvailableUsers[0]
      return findUserCompleteTimeBlock(dateIndex, timeIndex, userName)
    }
    
    // 多个用户：需要更智能的处理
    return findOptimalTimeBlock(dateIndex, timeIndex, currentAvailableUsers)
  }
  
  // 找到单个用户的完整连续时间段
  const findUserCompleteTimeBlock = (dateIndex: number, startTimeIndex: number, userName: string) => {
    // 向前查找连续时间段的开始
    let blockStart = startTimeIndex
    while (blockStart > 0) {
      const prevHeatmapDetails = getHeatmapDetails(dateIndex, blockStart - 1)
      if (!prevHeatmapDetails.userNames.includes(userName)) {
        break
      }
      blockStart--
    }
    
    // 向后查找连续时间段的结束
    let blockEnd = startTimeIndex
    while (blockEnd < timeSlots.length - 1) {
      const nextHeatmapDetails = getHeatmapDetails(dateIndex, blockEnd + 1)
      if (!nextHeatmapDetails.userNames.includes(userName)) {
        break
      }
      blockEnd++
    }
    
    // 获取不可行用户列表
    const allParticipants = new Set<string>()
    userResponses.forEach(response => {
      allParticipants.add(response.userName)
    })
    if (currentUser) {
      const currentUserAlreadySubmitted = userResponses.some(
        response => response.userName === currentUser.userName
      )
      if (!currentUserAlreadySubmitted) {
        allParticipants.add(currentUser.userName)
      }
    }
    
    const unavailableUsers: string[] = []
    allParticipants.forEach(participantName => {
      if (participantName !== userName) {
        unavailableUsers.push(participantName)
      }
    })
    
    return {
      dateIndex,
      startTimeIndex: blockStart,
      endTimeIndex: blockEnd,
      availableUsers: [userName],
      unavailableUsers,
      blockType: 'single-user' as const,
      showBasicTimeOnly: false
    }
  }
  
  // 优化的多用户时间块查找：考虑多种情况
  const findOptimalTimeBlock = (dateIndex: number, startTimeIndex: number, currentAvailableUsers: string[]) => {
    // 策略1：尝试找到所有当前用户都可行的最大连续时间段
    const maxOverlapBlock = findMaxOverlapTimeBlock(dateIndex, startTimeIndex, currentAvailableUsers)
    
    // 策略2：如果重叠时间段太短（只有1个时段），考虑显示当前时段的用户分布
    if (maxOverlapBlock && maxOverlapBlock.endTimeIndex - maxOverlapBlock.startTimeIndex < 2) {
      // 获取所有参与者
      const allParticipants = new Set<string>()
      userResponses.forEach(response => {
        allParticipants.add(response.userName)
      })
      if (currentUser) {
        const currentUserAlreadySubmitted = userResponses.some(
          response => response.userName === currentUser.userName
        )
        if (!currentUserAlreadySubmitted) {
          allParticipants.add(currentUser.userName)
        }
      }
      
      // 计算不可行用户
      const unavailableUsers: string[] = []
      allParticipants.forEach(userName => {
        if (!currentAvailableUsers.includes(userName)) {
          unavailableUsers.push(userName)
        }
      })
      
      // 返回当前时段的用户分布情况
      return {
        dateIndex,
        startTimeIndex: startTimeIndex,
        endTimeIndex: startTimeIndex,
        availableUsers: [...currentAvailableUsers],
        unavailableUsers,
        blockType: 'current-slot' as const,
        showBasicTimeOnly: false
      }
    }
    
    return maxOverlapBlock
  }
  
  // 找到多用户的最大连续重叠时间段
  const findMaxOverlapTimeBlock = (dateIndex: number, startTimeIndex: number, requiredUsers: string[]) => {
    // 从当前时段开始，向两边扩展，找到所有用户都可行的最大连续时间段
    
    // 向前查找连续重叠的开始
    let blockStart = startTimeIndex
    while (blockStart > 0) {
      const prevHeatmapDetails = getHeatmapDetails(dateIndex, blockStart - 1)
      const prevAvailableUsers = prevHeatmapDetails.userNames
      
      // 检查是否所有必需用户都在前一个时段可行
      const allUsersAvailable = requiredUsers.every(user => prevAvailableUsers.includes(user))
      if (!allUsersAvailable) {
        break
      }
      blockStart--
    }
    
    // 向后查找连续重叠的结束
    let blockEnd = startTimeIndex
    while (blockEnd < timeSlots.length - 1) {
      const nextHeatmapDetails = getHeatmapDetails(dateIndex, blockEnd + 1)
      const nextAvailableUsers = nextHeatmapDetails.userNames
      
      // 检查是否所有必需用户都在下一个时段可行
      const allUsersAvailable = requiredUsers.every(user => nextAvailableUsers.includes(user))
      if (!allUsersAvailable) {
        break
      }
      blockEnd++
    }
    
    // 获取所有参与者列表，计算不可行用户
    const allParticipants = new Set<string>()
    userResponses.forEach(response => {
      allParticipants.add(response.userName)
    })
    if (currentUser) {
      const currentUserAlreadySubmitted = userResponses.some(
        response => response.userName === currentUser.userName
      )
      if (!currentUserAlreadySubmitted) {
        allParticipants.add(currentUser.userName)
      }
    }
    
    const unavailableUsers: string[] = []
    allParticipants.forEach(userName => {
      if (!requiredUsers.includes(userName)) {
        unavailableUsers.push(userName)
      }
    })
    
    return {
      dateIndex,
      startTimeIndex: blockStart,
      endTimeIndex: blockEnd,
      availableUsers: [...requiredUsers],
      unavailableUsers,
      blockType: 'multi-user' as const,
      showBasicTimeOnly: false
    }
  }
  
  // 格式化智能时间段的显示
  const formatIntelligentTimeBlock = (timeBlock: ReturnType<typeof getIntelligentTimeBlock>) => {
    if (!timeBlock || !currentEvent) return null
    
    const date = dates[timeBlock.dateIndex]
    const startTime = timeSlots[timeBlock.startTimeIndex]
    
    // 如果是无可行性情况，只显示基础时间信息
    if (timeBlock.showBasicTimeOnly) {
      return {
        dateTime: `${date} ${startTime}`,
        isBasicTimeOnly: true
      }
    }
    
    // 如果是单个时段，只显示该时段
    if (timeBlock.startTimeIndex === timeBlock.endTimeIndex) {
      return {
        dateTime: `${date} ${startTime}`,
        isBasicTimeOnly: false
      }
    }
    
    // 多个时段，显示时间范围
    const endTime = timeSlots[timeBlock.endTimeIndex]
    
    // 计算结束时间（需要加15分钟）
    const [endHour, endMinute] = endTime.split(':').map(Number)
    const endDateTime = new Date()
    endDateTime.setHours(endHour, endMinute + 15, 0, 0)
    const actualEndTime = `${endDateTime.getHours().toString().padStart(2, '0')}:${endDateTime.getMinutes().toString().padStart(2, '0')}`
    
    return {
      dateTime: `${date} ${startTime}-${actualEndTime}`,
      isBasicTimeOnly: false
    }
  }

  const getSlotDetails = (dateIndex: number, timeIndex: number) => {
    if (!hoveredSlot || hoveredSlot.dateIndex !== dateIndex || hoveredSlot.timeIndex !== timeIndex) {
      return null
    }

    // 使用智能时间段提取
    const intelligentBlock = getIntelligentTimeBlock(dateIndex, timeIndex)
    if (!intelligentBlock) return null
    
    return {
      ...intelligentBlock,
      totalParticipants: intelligentBlock.availableUsers.length + intelligentBlock.unavailableUsers.length,
      selectedCount: intelligentBlock.availableUsers.length
    }
  }

  // 获取当前最大重合人数
  const getMaxOverlapCount = (): number => {
    let maxCount = 0
    
    if (currentEvent?.includeTime) {
      // 时间模式：检查所有时间段
      dates.forEach((_, dateIndex) => {
        timeSlots.forEach((_, timeIndex) => {
          const details = getHeatmapDetails(dateIndex, timeIndex)
          if (details.count > maxCount) {
            maxCount = details.count
          }
        })
      })
    } else {
      // 仅日期模式：只检查日期（使用timeIndex=0）
      dates.forEach((_, dateIndex) => {
        const details = getHeatmapDetails(dateIndex, 0)
        if (details.count > maxCount) {
          maxCount = details.count
        }
      })
    }
    
    return maxCount
  }

  // 检查是否有任何用户选择了时间（包括当前用户的本地选择）
  const hasAnyUserSelection = (): boolean => {
    // 检查当前用户是否有本地选择
    const hasCurrentUserSelection = currentEvent?.includeTime 
      ? timeGrid.getSelectedSlots().length > 0
      : selectedDates.size > 0
    
    // 检查其他参与者是否有选择
    const hasOtherUserSelection = userResponses.some(p => 
      p.userName !== currentUser?.userName && p.availability && p.availability.length > 0
    )
    
    return hasCurrentUserSelection || hasOtherUserSelection
  }

  // 获取当前实际存在的重合等级
  const getExistingOverlapLevels = (): number[] => {
    const levels = new Set<number>()
    
    if (currentEvent?.includeTime) {
      // 时间模式：检查所有时间段
      dates.forEach((_, dateIndex) => {
        timeSlots.forEach((_, timeIndex) => {
          const details = getHeatmapDetails(dateIndex, timeIndex)
          if (details.count > 0) {
            levels.add(details.count)
          }
        })
      })
    } else {
      // 仅日期模式：只检查日期
      dates.forEach((_, dateIndex) => {
        const details = getHeatmapDetails(dateIndex, 0)
        if (details.count > 0) {
          levels.add(details.count)
        }
      })
    }
    
    return Array.from(levels).sort((a, b) => a - b)
  }

  // 获取颜色映射
  const getColorForLevel = (level: number): string => {
    const colorMap: { [key: number]: string } = {
      0: 'bg-white',
      1: 'bg-[#e0f2fe]',
      2: 'bg-[#bae6fd]',
      3: 'bg-[#7dd3fc]',
      4: 'bg-[#38bdf8]',
      5: 'bg-[#0ea5e9]',
      6: 'bg-[#0284c7]',
      7: 'bg-[#0369a1]'
    }
    return colorMap[level] || 'bg-[#0369a1]' // 7+人都用最深色
  }

  // 处理用户登录
  const handleSignIn = () => {
    if (!tempUserName.trim()) {
      alert('请输入你的名字')
      return
    }
    
    // 初始化当前用户
    initCurrentUser(tempUserName.trim(), userTimezone)
    
    // 保存用户名到本地存储
    localStorage.setItem(`participant-name-${eventId}`, tempUserName.trim())
    setShowSignIn(false)
  }

  // 如果需要显示登录界面
  if (showSignIn) {
    return (
      <div className="h-full bg-gray-50/30 flex items-center justify-center relative">
        {/* 背景涂层 - 与sidebar颜色一致 */}
        <div className="fixed inset-0 -z-10" style={{ backgroundColor: '#f8fafc' }} />
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl shadow-black/5 w-full max-w-md">
          <h2 className="text-2xl font-medium text-gray-900 text-center mb-6 tracking-wide">参与活动</h2>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="userName" className="text-sm font-medium text-gray-700">
                你的姓名
              </Label>
              <Input
                id="userName"
                value={tempUserName}
                onChange={(e) => setTempUserName(e.target.value)}
                placeholder="输入你的姓名"
                className="w-full"
              />
            </div>
            
            {/* 参与者时区确认 */}
            <div className="space-y-3">
              <Label htmlFor="userTimezone" className="text-sm font-medium text-gray-700">
                你的时区 (将以此为你显示时间)
              </Label>
              <Select value={userTimezone} onValueChange={setUserTimezone}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC-12">UTC-12 贝克岛时间</SelectItem>
                  <SelectItem value="UTC-11">UTC-11 美属萨摩亚时间</SelectItem>
                  <SelectItem value="UTC-10">UTC-10 夏威夷时间</SelectItem>
                  <SelectItem value="UTC-9">UTC-9 阿拉斯加时间</SelectItem>
                  <SelectItem value="UTC-8">UTC-8 美国西部时间</SelectItem>
                  <SelectItem value="UTC-7">UTC-7 美国山地时间</SelectItem>
                  <SelectItem value="UTC-6">UTC-6 美国中部时间</SelectItem>
                  <SelectItem value="UTC-5">UTC-5 美国东部时间</SelectItem>
                  <SelectItem value="UTC-4">UTC-4 加拿大大西洋时间</SelectItem>
                  <SelectItem value="UTC-3">UTC-3 巴西时间</SelectItem>
                  <SelectItem value="UTC-2">UTC-2 南乔治亚岛时间</SelectItem>
                  <SelectItem value="UTC-1">UTC-1 葡萄牙亚速尔群岛时间</SelectItem>
                  <SelectItem value="UTC+0">UTC+0 英国时间</SelectItem>
                  <SelectItem value="UTC+1">UTC+1 欧洲中部时间</SelectItem>
                  <SelectItem value="UTC+2">UTC+2 欧洲东部时间</SelectItem>
                  <SelectItem value="UTC+3">UTC+3 土耳其/沙特时间</SelectItem>
                  <SelectItem value="UTC+4">UTC+4 阿联酋时间</SelectItem>
                  <SelectItem value="UTC+5">UTC+5 巴基斯坦时间</SelectItem>
                  <SelectItem value="UTC+6">UTC+6 孟加拉时间</SelectItem>
                  <SelectItem value="UTC+7">UTC+7 越南/泰国时间</SelectItem>
                  <SelectItem value="UTC+8">UTC+8 中国标准时间</SelectItem>
                  <SelectItem value="UTC+9">UTC+9 日本/韩国时间</SelectItem>
                  <SelectItem value="UTC+10">UTC+10 澳大利亚东部时间</SelectItem>
                  <SelectItem value="UTC+11">UTC+11 所罗门群岛时间</SelectItem>
                  <SelectItem value="UTC+12">UTC+12 新西兰时间</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-2">
                已自动检测为 {getUserTimezone()}，你可以根据需要修改
              </p>
            </div>
            
            <div className="pt-2">
              <Button
                onClick={handleSignIn}
                disabled={!tempUserName.trim()}
                className="w-full h-12 text-white font-medium rounded-lg transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed border-0 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: !tempUserName.trim()
                    ? '#9CA3AF' // 灰色 - 禁用状态
                    : '#000000' // 纯黑 - 可点击状态
                }}
              >
                加入活动
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-gray-50/30 flex flex-col relative">
      {/* 背景涂层 - 与sidebar颜色一致 */}
      <div className="fixed inset-0 -z-10" style={{ backgroundColor: '#f8fafc' }} />
      {/* 顶部信息区域 - Apple风格 */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 px-8 py-3 rounded-2xl">
        <div className="flex items-center justify-between">
          {/* 左侧：活动信息 */}
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-semibold text-gray-900 tracking-wide">
                    Timee Area-{eventId?.replace('tc-', '') || currentEvent.id?.replace('tc-', '')}
                  </h1>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyLink}
                    className="h-4 w-4 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 transition-all duration-200"
                  >
                    {copied ? (
                      <Check className="w-2.5 h-2.5" />
                    ) : (
                      <Copy className="w-2.5 h-2.5" />
                    )}
                  </Button>
                </div>
                {/* 活动内容备注 - 显示在标题下方，时区上方 */}
                {currentEvent.description && (
                  <p className="text-sm text-gray-600 font-medium mt-1 mb-1">
                    {currentEvent.description}
                  </p>
                )}
              </div>
            </div>
            {/* 极简时区信息显示 */}
            <div className={`text-xs text-gray-400 font-light ${currentEvent.description ? 'mt-1' : 'mt-3'}`}>
              <span>
                {(() => {
                  const timezoneMap: { [key: string]: string } = {
                    'UTC-12': 'UTC-12 贝克岛时间',
                    'UTC-11': 'UTC-11 美属萨摩亚时间',
                    'UTC-10': 'UTC-10 夏威夷时间',
                    'UTC-9': 'UTC-9 阿拉斯加时间',
                    'UTC-8': 'UTC-8 美国西部时间',
                    'UTC-7': 'UTC-7 美国山地时间',
                    'UTC-6': 'UTC-6 美国中部时间',
                    'UTC-5': 'UTC-5 美国东部时间',
                    'UTC-4': 'UTC-4 加拿大大西洋时间',
                    'UTC-3': 'UTC-3 巴西时间',
                    'UTC-2': 'UTC-2 南乔治亚岛时间',
                    'UTC-1': 'UTC-1 葡萄牙亚速尔群岛时间',
                    'UTC+0': 'UTC+0 英国时间',
                    'UTC+1': 'UTC+1 欧洲中部时间',
                    'UTC+2': 'UTC+2 欧洲东部时间',
                    'UTC+3': 'UTC+3 土耳其/沙特时间',
                    'UTC+4': 'UTC+4 阿联酋时间',
                    'UTC+5': 'UTC+5 巴基斯坦时间',
                    'UTC+6': 'UTC+6 孟加拉时间',
                    'UTC+7': 'UTC+7 越南/泰国时间',
                    'UTC+8': 'UTC+8 中国标准时间',
                    'UTC+9': 'UTC+9 日本/韩国时间',
                    'UTC+10': 'UTC+10 澳大利亚东部时间',
                    'UTC+11': 'UTC+11 所罗门群岛时间',
                    'UTC+12': 'UTC+12 新西兰时间'
                  }
                  return timezoneMap[currentEvent.timezone] || currentEvent.timezone
                })()}
              </span>
            </div>
          </div>
          
          {/* 右侧：参与者数量 */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>{userResponses.filter(p => p.availability && p.availability.length > 0).length} 人参与</span>
          </div>
        </div>
      </div>

      {/* 主体三栏布局 */}
      <div className="flex-1 flex min-h-0 gap-8 px-8 py-6">
        {/* 悬浮式时段详情 Popover - 只在团队热力图悬浮时显示 */}
        {(currentEvent?.includeTime ? hoveredSlot : hoveredDate) && popoverPosition && (
          <div 
            className="fixed z-50 pointer-events-none"
            style={{
              left: `${popoverPosition.x}px`,
              top: `${popoverPosition.y - 120}px`, // 鼠标正上方120px
              transform: 'translateX(-50%)'
            }}
          >
            {/* 增强液态玻璃卡片 */}
            <div className="relative group">
              {/* 主卡片 - 高质感液态玻璃效果 */}
              <div className="relative bg-white/10 backdrop-blur-[40px] border border-white/20 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] px-4 py-3 min-w-0 overflow-hidden">
                {/* 多层玻璃质感 */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/5 to-transparent rounded-2xl"></div>
                <div className="absolute inset-0 bg-gradient-to-tl from-blue-50/20 via-transparent to-purple-50/15 rounded-2xl"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent rounded-2xl"></div>
                
                {/* 内部反射光效 */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-60"></div>
                <div className="absolute inset-px rounded-2xl bg-gradient-to-br from-white/60 via-transparent to-transparent opacity-30"></div>
                
                {/* 边缘高光 */}
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/30"></div>
                
                {/* 动态光晕 */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-100/20 via-transparent to-pink-100/15 opacity-40 group-hover:opacity-60 transition-opacity duration-700"></div>
                
                {/* 磨砂质感层 */}
                <div className="absolute inset-0 rounded-2xl bg-white/5 backdrop-blur-sm"></div>
                
                {/* 内容区域 */}
                <div className="relative z-10 backdrop-blur-[2px]">
                  {currentEvent?.includeTime ? (
                    // 时间模式：显示时段详情
                    hoveredSlot && (() => {
                      const details = getSlotDetails(hoveredSlot.dateIndex, hoveredSlot.timeIndex)
                      if (!details) return null

                      return (
                        <div className="text-center space-y-3">
                          {/* 显示智能时间段信息 */}
                          <div className="space-y-1">
                            <div className="text-sm font-semibold text-gray-900/95 leading-tight drop-shadow-sm">
                              {(() => {
                                const timeBlockInfo = formatIntelligentTimeBlock(details)
                                return timeBlockInfo ? timeBlockInfo.dateTime : ''
                              })()}
                            </div>
                          </div>
                          
                          {/* 用户状态 - 左右布局 */}
                          {(() => {
                            // 总是显示用户状态，除非完全没有参与者
                            if (details.availableUsers.length > 0 || details.unavailableUsers.length > 0) {
                              return (
                                <div className="flex items-center justify-center gap-3">
                                  {/* 可行用户 - 左侧绿色 */}
                                  {details.availableUsers.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {details.availableUsers.map((user: string, index: number) => (
                                        <div key={`available-${index}`} className="flex items-center space-x-1 bg-green-100/60 backdrop-blur-md border border-green-200/50 rounded-full px-2 py-1 shadow-sm">
                                          <div className="w-1.5 h-1.5 bg-green-600 rounded-full drop-shadow-sm"></div>
                                          <span className="text-xs font-medium text-gray-900/95 drop-shadow-sm">{user}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  
                                  {/* 分隔线 */}
                                  {details.availableUsers.length > 0 && details.unavailableUsers.length > 0 && (
                                    <div className="w-px h-4 bg-gray-400/50 shadow-sm"></div>
                                  )}
                                  
                                  {/* 不可行用户 - 右侧红色 */}
                                  {details.unavailableUsers.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {details.unavailableUsers.map((user: string, index: number) => (
                                        <div key={`unavailable-${index}`} className="flex items-center space-x-1 bg-red-100/60 backdrop-blur-md border border-red-200/50 rounded-full px-2 py-1 shadow-sm">
                                          <div className="w-1.5 h-1.5 bg-red-600 rounded-full drop-shadow-sm"></div>
                                          <span className="text-xs font-medium text-gray-900/95 drop-shadow-sm">{user}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )
                            }
                            
                            return null
                          })()}
                        </div>
                      )
                    })()
                  ) : (
                    // 仅日期模式：显示日期详情
                    hoveredDate && (() => {
                      const details = getDateDetails(hoveredDate)
                      
                      // 从热力图数据中获取该日期的可行用户（这些用户已经经过正确的paintMode处理）
                      const availableUsers = 'userNames' in details ? [...details.userNames] : []
                      const unavailableUsers: string[] = []
                      
                      // 获取所有参与者列表
                      const allParticipants = new Set<string>()
                      
                      // 添加已提交的用户
                      userResponses.forEach(response => {
                        allParticipants.add(response.userName)
                      })
                      
                      // 添加当前用户（如果还没提交）
                      if (currentUser) {
                        const currentUserAlreadySubmitted = userResponses.some(
                          response => response.userName === currentUser.userName
                        )
                        
                        if (!currentUserAlreadySubmitted) {
                          allParticipants.add(currentUser.userName)
                        }
                      }
                      
                      // 将不在可行用户列表中的用户添加到不可行用户列表
                      allParticipants.forEach(userName => {
                        if (!availableUsers.includes(userName)) {
                          unavailableUsers.push(userName)
                        }
                      })

                      return (
                        <div className="text-center space-y-3">
                          {/* 显示智能时间段信息 */}
                          <div className="space-y-1">
                            <div className="text-sm font-semibold text-gray-900/95 leading-tight drop-shadow-sm">
                              {(() => {
                                // 格式化为英文日期格式
                                const [month, day] = hoveredDate.split('/').map(Number)
                                const year = new Date().getFullYear()
                                const dateObj = new Date(year, month - 1, day)
                                const englishWeekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                                const englishMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
                                
                                return `${englishWeekdays[dateObj.getDay()]}, ${englishMonths[dateObj.getMonth()]} ${day}`
                              })()}
                            </div>
                          </div>
                          
                          {/* 用户状态 - 左右布局 */}
                          {(availableUsers.length > 0 || unavailableUsers.length > 0) && (
                            <div className="flex items-center justify-center gap-3">
                              {/* 可行用户 - 左侧绿色 */}
                              {availableUsers.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {availableUsers.map((user: string, index: number) => (
                                    <div key={`available-${index}`} className="flex items-center space-x-1 bg-green-100/60 backdrop-blur-md border border-green-200/50 rounded-full px-2 py-1 shadow-sm">
                                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full drop-shadow-sm"></div>
                                      <span className="text-xs font-medium text-gray-900/95 drop-shadow-sm">{user}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {/* 分隔线 */}
                              {availableUsers.length > 0 && unavailableUsers.length > 0 && (
                                <div className="w-px h-4 bg-gray-400/50 shadow-sm"></div>
                              )}
                              
                              {/* 不可行用户 - 右侧红色 */}
                              {unavailableUsers.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {unavailableUsers.map((user: string, index: number) => (
                                    <div key={`unavailable-${index}`} className="flex items-center space-x-1 bg-red-100/60 backdrop-blur-md border border-red-200/50 rounded-full px-2 py-1 shadow-sm">
                                      <div className="w-1.5 h-1.5 bg-red-600 rounded-full drop-shadow-sm"></div>
                                      <span className="text-xs font-medium text-gray-900/95 drop-shadow-sm">{user}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })()
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 左栏：我的可用时间 */}
        <div className="w-1/2 bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm flex flex-col">
          <div className="p-4">
            <h2 className="text-base font-medium text-gray-900 mb-3">{currentUser?.userName}的可用时间</h2>

            {/* 画笔模式切换 - 滑块风格 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {/* 滑块容器 */}
                <div className="relative bg-gray-100 rounded-xl p-0.5 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]">
                  <div className="flex">
                    {/* 可行时间选项 */}
                    <button
                      onClick={() => {
                        if (currentEvent?.includeTime) {
                          timeGrid.clearSelection()
                        }
                        updateLocalSelection([], 'available')
                      }}
                      className={cn(
                        "relative z-10 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 ease-out",
                        currentUser?.paintMode === 'available'
                          ? "text-gray-800"
                          : "text-gray-500 hover:text-gray-700"
                      )}
                    >
                      可行时间
                    </button>
                    
                    {/* 不可行时间选项 */}
                    <button
                      onClick={() => {
                        if (currentEvent?.includeTime) {
                          timeGrid.clearSelection()
                        }
                        updateLocalSelection([], 'unavailable')
                      }}
                      className={cn(
                        "relative z-10 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 ease-out",
                        currentUser?.paintMode === 'unavailable'
                          ? "text-gray-800"
                          : "text-gray-500 hover:text-gray-700"
                      )}
                    >
                      不可行时间
                    </button>
                  </div>
                  
                  {/* 滑动指示器 */}
                  <div
                    className={cn(
                      "absolute top-0.5 bottom-0.5 bg-white rounded-lg shadow-[2px_2px_4px_rgba(0,0,0,0.15),-1px_-1px_2px_rgba(255,255,255,0.8)] transition-all duration-300 ease-out",
                      currentUser?.paintMode === 'available' 
                        ? "left-0.5 right-[50%]" 
                        : "left-[50%] right-0.5"
                    )}
                  />
                </div>
              </div>
              
              {/* 重置按钮 */}
              <button
                onClick={() => {
                  if (currentEvent?.includeTime) {
                    timeGrid.clearSelection()
                  } else {
                    updateLocalSelection([])
                  }
                  // 强制触发状态更新以确保右侧面板正确显示
                }}
                className="px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-50 rounded-md shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.8)] hover:shadow-[1px_1px_2px_rgba(0,0,0,0.1),-1px_-1px_2px_rgba(255,255,255,0.8)] hover:scale-98 active:scale-95 transition-all duration-300 ease-out transform"
                title="清空所有选择"
              >
                重置
              </button>
            </div>

            <p className="text-xs text-gray-400 font-light mb-3">
              {currentUser?.paintMode === 'available' 
                ? '勾选你可以参加的时间段' 
                : '勾选你不能参加的时间段，未勾选的将作为可用时间'
              }
            </p>
          </div>

          {/* 条件渲染：时间网格 vs 日期选择 */}
          <div className="flex-1 p-4 pt-0 overflow-auto min-h-0">
            {currentEvent?.includeTime ? (
              // 包含时间的模式：显示时间网格
              <div 
                className="min-w-[300px]"
                ref={timeGrid.setGridContainer}
              >
                {/* 日期表头 */}
                <div className="grid mb-4" style={{ gridTemplateColumns: `80px repeat(${dates.length}, 1fr)` }}>
                  <div></div>
                  {dates.map((date, index) => {
                    const { weekday, formattedDate } = formatDateDisplay(date)
                    return (
                      <div key={index} className={`text-center ${dates.length > 5 ? 'py-1' : 'py-2'}`}>
                        <div className={`font-medium text-green-600 ${dates.length > 5 ? 'mb-0.5 text-xs' : 'mb-1 text-sm'}`}>{weekday}</div>
                        <div className={`font-semibold text-gray-700 ${dates.length > 5 ? 'text-xs' : 'text-sm'}`}>{formattedDate}</div>
                      </div>
                    )
                  })}
                </div>

                {/* 时间行和网格单元格 */}
                <div className="bg-white/50 backdrop-blur-sm">
                  {timeSlots.map((timeSlot, timeIndex) => (
                    <div key={timeIndex} className="grid gap-0 relative" style={{ gridTemplateColumns: `80px repeat(${dates.length}, 1fr)` }}>
                      {/* 整点时间分隔线 */}
                      {timeSlot.endsWith(':00') && timeIndex > 0 && (
                        <div className="absolute top-0 left-20 right-0 h-px bg-gray-300/60 z-10" />
                      )}
                      
                      {/* 时间标签 - 只在整点显示，位置调整到行的中间 */}
                      <div className="flex items-center justify-center h-6 text-sm font-medium text-gray-600 relative">
                        {timeSlot.endsWith(':00') && (
                          <div className="absolute -top-3 left-0 right-0 flex items-center justify-center">
                            <span className="bg-white px-2 text-xs text-gray-500 font-medium">
                              {timeSlot}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* 时间单元格 */}
                      {dates.map((_, dateIndex) => {
                        const cellState = getCellState(dateIndex, timeIndex)
                        return (
                          <div
                            key={dateIndex}
                            className={cn(
                              "h-6 select-none relative group",
                              {
                                // 默认状态 - 简约扁平风格，hover时使用品牌色
                                'bg-gray-50/80 hover:bg-emerald-50/90 cursor-pointer': cellState === 'default',
                                
                                // 可用时间 - 高级绿色扁平风格
                                'bg-emerald-500/90 hover:bg-emerald-500 cursor-pointer': cellState === 'available',
                                
                                // 不可用时间 - 高级深红色扁平风格  
                                'bg-red-600/90 hover:bg-red-600 cursor-pointer': cellState === 'unavailable',
                                
                                // 拖拽状态 - 精致的拖拽指示器
                                'cursor-grabbing': timeGrid.isSelecting,
                              }
                            )}
                            onPointerDown={(e) => {
                              const dateStr = dates[dateIndex]
                              const fullDateInfo = getFullDateInfo(dateStr)
                              setDragDateInfo({
                                dateIndex,
                                dateStr,
                                weekday: fullDateInfo.weekday,
                                formattedDate: fullDateInfo.formattedDate
                              })
                              timeGrid.handlePointerDown(dateIndex, timeIndex, e)
                            }}
                            onPointerMove={() => {
                              // 只在拖拽状态下且日期改变时更新日期信息
                              if (timeGrid.isSelecting && (!dragDateInfo || dragDateInfo.dateIndex !== dateIndex)) {
                                const dateStr = dates[dateIndex]
                                const fullDateInfo = getFullDateInfo(dateStr)
                                setDragDateInfo({
                                  dateIndex,
                                  dateStr,
                                  weekday: fullDateInfo.weekday,
                                  formattedDate: fullDateInfo.formattedDate
                                })
                              }
                              timeGrid.handlePointerMove(dateIndex, timeIndex)
                            }}
                            onPointerUp={() => {
                              setDragDateInfo(null)
                              timeGrid.handlePointerUp()
                            }}
                          >
                            {/* 悬浮效果指示器 */}
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                          </div>
                        
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // 仅日期模式：显示日期选择器
              <DateOnlySelector
                dates={dates}
                selectedDates={selectedDates}
                onDateToggle={handleDateToggle}
                paintMode={currentUser?.paintMode || 'available'}
                formatDateDisplay={formatDateDisplay}
              />
            )}
          </div>
        </div>

        {/* 右栏：团队可用性总览 */}
        <div className="w-1/2 bg-white/40 backdrop-blur-xl rounded-2xl shadow-sm flex flex-col">
           <div className="p-4">
             <h2 className="text-base font-medium text-gray-900 mb-3">
               {currentEvent?.includeTime ? '团队可用时间' : '团队可用日期'}
             </h2>
             
             {/* 色带区域 - 与左栏的toggle和重置按钮对齐 */}
             <div className="flex items-center justify-between mb-4">
               {/* 色带 - 只在有用户选择时显示 */}
               {hasAnyUserSelection() ? (
                 <div className="flex-1">
                   {/* 色带渐变条 */}
                   <div className="flex items-center space-x-2 mb-2">
                     <span className="text-xs text-gray-500">0可行</span>
                     <div className="flex-1 h-4 rounded-full overflow-hidden flex">
                       {(() => {
                         const existingLevels = getExistingOverlapLevels()

                         
                         if (existingLevels.length === 0) {
                           return <div className="flex-1 bg-white"></div>
                         }
                         
                         return existingLevels.map((level) => (
                           <div 
                             key={level} 
                             className={`flex-1 ${getColorForLevel(level)}`}
                             title={`${level}人重合`}
                           ></div>
                         ))
                       })()}
                     </div>
                     <span className="text-xs text-gray-500">{getMaxOverlapCount()}可行</span>
                   </div>
                 </div>
               ) : (
                 <div className="flex-1"></div>
               )}
               
               {/* 占位元素 - 与左栏重置按钮位置对齐 */}
               <div className="w-16"></div>
             </div>

             {/* 色带说明 - 与左栏备注文字对齐 */}
             <p className="text-xs text-gray-400 font-light mb-3">
               {hasAnyUserSelection() ? (
                 (() => {
                   const existingLevels = getExistingOverlapLevels()
                   if (existingLevels.length === 0) return currentEvent?.includeTime ? '暂无时间重合' : '暂无日期重合'
                   if (existingLevels.length === 1) {
                     return currentEvent?.includeTime 
                       ? `当前有 ${existingLevels[0]} 人时间重合`
                       : `当前有 ${existingLevels[0]} 人日期重合`
                   }
                   return currentEvent?.includeTime
                     ? `当前有 ${existingLevels.length} 种重合等级：${existingLevels.join('、')} 人`
                     : `当前有 ${existingLevels.length} 种重合等级：${existingLevels.join('、')} 人`
                 })()
               ) : (
                 currentEvent?.includeTime 
                   ? '等待用户选择时间以显示重合情况'
                   : '等待用户选择日期以显示重合情况'
               )}
             </p>
           </div>

           {/* 团队热力图 */}
           <div className="flex-1 p-4 pt-0 overflow-auto min-h-0">
             {hasAnyUserSelection() ? (
               currentEvent?.includeTime ? (
                 // 时间模式：显示时间热力图
                 <div className="space-y-2">
                   {/* 热力图网格 */}
                   <div className="bg-white/50 backdrop-blur-sm">
                     <div className="min-w-[300px]">
                       {/* 日期表头 */}
                       <div className="grid mb-4" style={{ gridTemplateColumns: `80px repeat(${dates.length}, 1fr)` }}>
                         <div></div>
                         {dates.map((date, index) => {
                           const { weekday, formattedDate } = formatDateDisplay(date)
                           return (
                             <div key={index} className={`text-center ${dates.length > 5 ? 'py-1' : 'py-2'}`}>
                               <div className={`font-medium text-blue-600 ${dates.length > 5 ? 'mb-0.5 text-xs' : 'mb-1 text-sm'}`}>{weekday}</div>
                               <div className={`font-semibold text-gray-700 ${dates.length > 5 ? 'text-xs' : 'text-sm'}`}>{formattedDate}</div>
                             </div>
                           )
                         })}
                       </div>

                     {/* 时间行和热力图单元格 */}
                     <div>
                       {timeSlots.map((timeSlot, timeIndex) => (
                         <div key={timeIndex} className="grid gap-0 relative" style={{ gridTemplateColumns: `80px repeat(${dates.length}, 1fr)` }}>
                           {/* 整点时间分隔线 */}
                           {timeSlot.endsWith(':00') && timeIndex > 0 && (
                             <div className="absolute top-0 left-20 right-0 h-px bg-gray-300/60 z-10" />
                           )}
                           
                           {/* 时间标签 - 只在整点显示，位置调整到行的中间 */}
                           <div className="flex items-center justify-center h-6 text-sm font-medium text-gray-600 relative">
                             {timeSlot.endsWith(':00') && (
                               <div className="absolute -top-3 left-0 right-0 flex items-center justify-center">
                                 <span className="bg-white px-2 text-xs text-gray-500 font-medium">
                                   {timeSlot}
                                 </span>
                               </div>
                             )}
                           </div>
                         
                           {/* 热力图单元格 */}
                           {dates.map((_, dateIndex) => {
                             const heatmapDetails = getHeatmapDetails(dateIndex, timeIndex)
                             const { count: participantCount, totalParticipants } = heatmapDetails
                             
                             return (
                               <div
                                 key={dateIndex}
                                 className={cn(
                                   "h-6 select-none relative group",
                                   {
                                     // 只在有人选择时显示颜色，否则保持空白
                                     'bg-gray-50/60 hover:bg-gray-100/80 cursor-default': participantCount === 0,
                                     'bg-sky-100/80 hover:bg-sky-200/90 cursor-pointer': participantCount === 1,
                                     'bg-sky-200/80 hover:bg-sky-300/90 cursor-pointer': participantCount === 2,
                                     'bg-sky-300/80 hover:bg-sky-400/90 cursor-pointer': participantCount === 3,
                                     'bg-sky-400/80 hover:bg-sky-500/90 cursor-pointer': participantCount === 4,
                                     'bg-sky-500/90 hover:bg-sky-600 cursor-pointer': participantCount === 5,
                                     'bg-sky-600/90 hover:bg-sky-700 cursor-pointer': participantCount === 6,
                                     'bg-sky-700/90 hover:bg-sky-800 cursor-pointer': participantCount >= 7,
                                   }
                                 )}
                                 title={`${dates[dateIndex]} ${timeSlot} - ${participantCount}/${totalParticipants} 人可行`}
                                 onMouseEnter={(e) => {
                                   setHoveredSlot({ dateIndex, timeIndex })
                                   // 计算当前格子的准确位置
                                   const rect = e.currentTarget.getBoundingClientRect()
                                   setPopoverPosition({
                                     x: rect.left + rect.width / 2,
                                     y: rect.top
                                   })
                                 }}
                                 onMouseLeave={() => {
                                   setHoveredSlot(null)
                                   setPopoverPosition(null)
                                 }}
                               >
                                 {/* 参与人数指示器 - 扁平风格 */}
                                 {participantCount >= 2 && (
                                   <div className="absolute inset-0 flex items-center justify-center">
                                     <div className={cn(
                                       "text-xs font-medium transition-all duration-200",
                                       participantCount >= 5 ? "text-white/95" : "text-gray-700/90"
                                     )}>
                                       {participantCount}
                                     </div>
                                   </div>
                                 )}
                                 
                                 {/* 悬浮效果指示器 */}
                                 <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                               </div>
                             )
                           })}
                         </div>
                       ))}
                       </div>
                     </div>
                   </div>
                 </div>
               ) : (
                 // 仅日期模式：显示日期热力图
                 <div className="mt-3">
                   <DateHeatmap
                     dates={dates}
                     formatDateDisplay={formatDateDisplay}
                     getDateDetails={getDateDetails}
                     onDateHover={(date: string | null, position?: { x: number; y: number }) => {
                       setHoveredDate(date)
                       if (position) {
                         setPopoverPosition(position)
                       } else {
                         setPopoverPosition(null)
                       }
                     }}
                     hoveredDate={hoveredDate}
                   />
                 </div>
               )
             ) : (
               /* 空白状态 - 没有用户选择时显示 */
               <div className="flex items-center justify-center h-full">
                 <div className="text-center text-gray-400">
                   {/* 空白状态 - 无提示文字 */}
                 </div>
               </div>
             )}
           </div>
         </div>
      </div>

      {/* 拖拽日期提示浮窗 */}
      {dragDateInfo && timeGrid.isSelecting && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
          <div className="bg-gray-700/90 backdrop-blur-sm text-white px-4 py-2 rounded-xl shadow-lg">
            <div className="text-center">
              <div className="text-sm font-medium">
                {dragDateInfo.formattedDate}
              </div>
              <div className="text-xs opacity-80 mt-0.5">
                {getFullDateInfo(dragDateInfo.dateStr).chineseWeekday}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 