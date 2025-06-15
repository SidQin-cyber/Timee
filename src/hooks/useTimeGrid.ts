import { useState, useCallback, useRef, useEffect } from 'react'

export interface TimeSlot {
  date: string
  time: string
  dateIndex: number
  timeIndex: number
  type?: 'available' | 'unavailable'
}

export interface UseTimeGridProps {
  dates: string[]
  timeSlots: string[]
  onSelectionChange?: (selectedSlots: TimeSlot[]) => void
  paintMode?: 'available' | 'unavailable'
}

export const useTimeGrid = ({ dates, timeSlots, onSelectionChange, paintMode = 'available' }: UseTimeGridProps) => {
  // 状态管理
  const [slotMap, setSlotMap] = useState<Map<string, 'available' | 'unavailable'>>(new Map())
  const [isSelecting, setIsSelecting] = useState(false)
  
  // 🚀 优化4：hover状态缓存，避免UI因异步slotMap更新而视觉卡顿
  const [hoverCache, setHoverCache] = useState<Map<string, 'available' | 'unavailable'>>(new Map())
  
  // 拖拽状态管理 - 增强版
  const isDragging = useRef(false)
  
  // 🚀 优化1：记录完整的上一个位置信息，更精确补齐
  const lastPosition = useRef<{ dateIndex: number; timeIndex: number } | null>(null)
  
  // 🚀 优化3：全局鼠标事件相关
  const gridContainerRef = useRef<HTMLElement | null>(null)
  const isGlobalListening = useRef(false)
  
  // 批处理相关
  const pendingChanges = useRef<Set<string>>(new Set())
  const rafId = useRef<number | null>(null)

  // 生成唯一的slot key
  const getSlotKey = useCallback((dateIndex: number, timeIndex: number): string => {
    return `${dateIndex}-${timeIndex}`
  }, [])

  // 🚀 新增：智能切换模式处理 - 根据每个格子的当前状态决定操作
  const processSlotIntelligentToggle = useCallback((dateIndex: number, timeIndex: number) => {
    const slotKey = getSlotKey(dateIndex, timeIndex)
    
    // 检查是否已经在pending changes中处理过
    if (pendingChanges.current.has(slotKey)) {
      return // 避免重复处理同一个格子
    }
    
    // 添加到pending changes
    pendingChanges.current.add(slotKey)
    
    // 获取当前格子的实际状态（不考虑hover缓存）
    const isCurrentlySelected = slotMap.has(slotKey)
    
    // 根据当前状态决定操作
    if (isCurrentlySelected) {
      // 如果当前已选中，hover缓存中移除（表示将要取消选择）
      setHoverCache(prev => {
        const newCache = new Map(prev)
        newCache.delete(slotKey)
        return newCache
      })
    } else {
      // 如果当前未选中，hover缓存中添加（表示将要选择）
      setHoverCache(prev => new Map(prev).set(slotKey, paintMode))
    }
  }, [getSlotKey, slotMap, paintMode])

  // 🚀 优化4：检查slot是否被选中（包含hover缓存，防止闪烁）
  const isSlotSelected = useCallback((dateIndex: number, timeIndex: number): boolean => {
    const slotKey = getSlotKey(dateIndex, timeIndex)
    const isInRealState = slotMap.has(slotKey)
    const isInHoverCache = hoverCache.has(slotKey)
    
    // 如果在pending changes中，以hover缓存状态为准
    if (pendingChanges.current.has(slotKey)) {
      return isInHoverCache
    }
    
    // 否则以实际状态为准
    return isInRealState
  }, [slotMap, hoverCache, getSlotKey])

  // 🚀 优化4：获取slot的类型（包含hover缓存，防止闪烁）
  const getSlotType = useCallback((dateIndex: number, timeIndex: number): 'available' | 'unavailable' | null => {
    const slotKey = getSlotKey(dateIndex, timeIndex)
    const realType = slotMap.get(slotKey)
    const hoverType = hoverCache.get(slotKey)
    
    // 如果在pending changes中，以hover缓存状态为准
    if (pendingChanges.current.has(slotKey)) {
      return hoverType || null
    }
    
    // 否则以实际状态为准
    return realType || null
  }, [slotMap, hoverCache, getSlotKey])

  // 🚀 优化4：智能批处理 - 根据每个格子的原始状态决定最终操作
  const applyPendingChangesIntelligent = useCallback(() => {
    if (pendingChanges.current.size === 0) return
    
    const newSlotMap = new Map(slotMap)
    let hasChanges = false
    
    pendingChanges.current.forEach(slotKey => {
      const isCurrentlySelected = newSlotMap.has(slotKey)
      const shouldBeSelected = hoverCache.has(slotKey)
      
      if (shouldBeSelected && !isCurrentlySelected) {
        // 应该选中但当前未选中 → 添加
        newSlotMap.set(slotKey, paintMode)
        hasChanges = true
      } else if (!shouldBeSelected && isCurrentlySelected) {
        // 不应该选中但当前已选中 → 移除
        newSlotMap.delete(slotKey)
        hasChanges = true
      }
    })
    
    if (!hasChanges) {
      pendingChanges.current.clear()
      return
    }
    
    // 立即更新状态
    setSlotMap(newSlotMap)
    
    // 触发回调
    if (onSelectionChange) {
      const selectedSlotsList = Array.from(newSlotMap.entries()).map(([key, type]) => {
        const [dateIndex, timeIndex] = key.split('-').map(Number)
        return {
          date: dates[dateIndex],
          time: timeSlots[timeIndex],
          dateIndex,
          timeIndex,
          type
        }
      })
      onSelectionChange(selectedSlotsList)
    }
    
    pendingChanges.current.clear()
  }, [slotMap, hoverCache, paintMode, dates, timeSlots, onSelectionChange])

  // 🚀 优化1&2：填补中间所有格子 - 支持斜向拖动（切换模式）
  const fillIntermediateSlotsToggle = useCallback((
    fromDateIndex: number, 
    fromTimeIndex: number, 
    toDateIndex: number, 
    toTimeIndex: number
  ) => {
    // 计算步长
    const dateStep = fromDateIndex === toDateIndex ? 0 : (toDateIndex > fromDateIndex ? 1 : -1)
    const timeStep = fromTimeIndex === toTimeIndex ? 0 : (toTimeIndex > fromTimeIndex ? 1 : -1)
    
    let currentDateIndex = fromDateIndex
    let currentTimeIndex = fromTimeIndex
    
    // 🚀 优化2：支持斜向拖动 - 同时在date和time维度移动
    while (currentDateIndex !== toDateIndex || currentTimeIndex !== toTimeIndex) {
      // 处理当前格子
      processSlotIntelligentToggle(currentDateIndex, currentTimeIndex)
      
      // 移动到下一个格子
      if (currentDateIndex !== toDateIndex) {
        currentDateIndex += dateStep
      }
      if (currentTimeIndex !== toTimeIndex) {
        currentTimeIndex += timeStep
      }
      
      // 防止无限循环
      if (Math.abs(currentDateIndex - fromDateIndex) > dates.length || 
          Math.abs(currentTimeIndex - fromTimeIndex) > timeSlots.length) {
        break
      }
    }
    
    // 处理目标格子
    processSlotIntelligentToggle(toDateIndex, toTimeIndex)
  }, [processSlotIntelligentToggle, dates.length, timeSlots.length])

  // 🚀 优化3：全局鼠标移动处理 - 通过坐标计算位置
  const handleGlobalPointerMove = useCallback((event: PointerEvent) => {
    if (!isDragging.current || !gridContainerRef.current) return

    // 🚀 优化3：通过鼠标位置计算网格坐标
    const rect = gridContainerRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    // 简化的坐标映射（需要根据实际网格布局调整）
    const cellWidth = rect.width / dates.length
    const cellHeight = 24 // 假设每个时间格子高度为24px
    
    const dateIndex = Math.floor(x / cellWidth)
    const timeIndex = Math.floor(y / cellHeight)
    
    // 边界检查
    if (dateIndex < 0 || dateIndex >= dates.length || 
        timeIndex < 0 || timeIndex >= timeSlots.length) {
      return
    }
    
    // 🚀 优化1：使用完整位置信息进行精确补齐
    if (lastPosition.current) {
      fillIntermediateSlotsToggle(
        lastPosition.current.dateIndex,
        lastPosition.current.timeIndex,
        dateIndex,
        timeIndex
      )
    } else {
      processSlotIntelligentToggle(dateIndex, timeIndex)
    }
    
    lastPosition.current = { dateIndex, timeIndex }
    
    // 减少批处理频率，避免过度更新
    if (!rafId.current) {
      rafId.current = requestAnimationFrame(() => {
        // 在拖拽过程中不立即应用变更，只在结束时应用
        rafId.current = null
      })
    }
  }, [dates.length, timeSlots.length, fillIntermediateSlotsToggle, processSlotIntelligentToggle])

  // 🚀 优化3：全局鼠标松开处理
  const handleGlobalPointerUp = useCallback(() => {
    if (!isDragging.current) return
    
    if (rafId.current) {
      cancelAnimationFrame(rafId.current)
      rafId.current = null
    }
    
    // 立即应用所有变更，确保同步更新
    applyPendingChangesIntelligent()
    
    // 立即重置状态，避免延迟
    setIsSelecting(false)
    isDragging.current = false
    lastPosition.current = null
    pendingChanges.current.clear()
    
    // 立即清空hover缓存
    setHoverCache(new Map())
    
    // 移除全局事件监听
    if (isGlobalListening.current) {
      document.removeEventListener('pointermove', handleGlobalPointerMove)
      document.removeEventListener('pointerup', handleGlobalPointerUp)
      isGlobalListening.current = false
    }
  }, [applyPendingChangesIntelligent])

  // 本地移动处理（保持兼容性）
  const handlePointerMove = useCallback((dateIndex: number, timeIndex: number) => {
    if (!isDragging.current) return

    // 🚀 优化1：使用完整位置信息进行精确补齐
    if (lastPosition.current) {
      fillIntermediateSlotsToggle(
        lastPosition.current.dateIndex,
        lastPosition.current.timeIndex,
        dateIndex,
        timeIndex
      )
    } else {
      processSlotIntelligentToggle(dateIndex, timeIndex)
    }
    
    lastPosition.current = { dateIndex, timeIndex }

    // 减少批处理频率
    if (!rafId.current) {
      rafId.current = requestAnimationFrame(() => {
        rafId.current = null
      })
    }
  }, [fillIntermediateSlotsToggle, processSlotIntelligentToggle])

  // 智能开始：确定拖拽模式
  const handlePointerDown = useCallback((dateIndex: number, timeIndex: number, event: React.PointerEvent) => {
    // 防止默认行为
    event.preventDefault()
    event.stopPropagation()
    
    // 设置拖拽状态
    setIsSelecting(true)
    isDragging.current = true
    
    // 初始化状态
    pendingChanges.current.clear()
    setHoverCache(new Map())
    lastPosition.current = { dateIndex, timeIndex }
    
    // 🚀 优化3：设置全局事件监听
    if (!isGlobalListening.current) {
      document.addEventListener('pointermove', handleGlobalPointerMove, { passive: false })
      document.addEventListener('pointerup', handleGlobalPointerUp)
      isGlobalListening.current = true
    }
    
    // 处理当前格子
    processSlotIntelligentToggle(dateIndex, timeIndex)
    
    // 不立即应用变更，等拖拽结束时统一处理
  }, [processSlotIntelligentToggle, handleGlobalPointerMove, handleGlobalPointerUp])

  // 结束拖拽
  const handlePointerUp = useCallback(() => {
    if (!isDragging.current) return
    
    if (rafId.current) {
      cancelAnimationFrame(rafId.current)
      rafId.current = null
    }
    
    // 立即应用所有变更，确保同步更新
    applyPendingChangesIntelligent()
    
    // 立即重置状态，避免延迟
    setIsSelecting(false)
    isDragging.current = false
    lastPosition.current = null
    pendingChanges.current.clear()
    
    // 立即清空hover缓存
    setHoverCache(new Map())
  }, [applyPendingChangesIntelligent])

  // 🚀 优化3：设置网格容器引用
  const setGridContainer = useCallback((element: HTMLElement | null) => {
    gridContainerRef.current = element
  }, [])

  // 清空所有选择
  const clearSelection = useCallback(() => {
    setSlotMap(new Map())
    setHoverCache(new Map()) // 同时清空hover缓存
    if (onSelectionChange) {
      onSelectionChange([])
    }
  }, [onSelectionChange])

  // 获取选中的slots列表
  const getSelectedSlots = useCallback((): TimeSlot[] => {
    return Array.from(slotMap.entries()).map(([key, type]) => {
      const [dateIndex, timeIndex] = key.split('-').map(Number)
      return {
        date: dates[dateIndex],
        time: timeSlots[timeIndex],
        dateIndex,
        timeIndex,
        type
      }
    })
  }, [slotMap, dates, timeSlots])

  // 清理RAF和全局事件
  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current)
      }
      if (isGlobalListening.current) {
        document.removeEventListener('pointermove', handleGlobalPointerMove)
        document.removeEventListener('pointerup', handleGlobalPointerUp)
      }
    }
  }, [handleGlobalPointerMove, handleGlobalPointerUp])



  return {
    selectedSlots: slotMap,
    isSelecting,
    isSlotSelected,
    getSlotType,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleGlobalPointerUp,
    clearSelection,
    getSelectedSlots,
    setGridContainer, // 🚀 新增：设置网格容器引用
    // 向后兼容的鼠标事件别名
    handleMouseDown: handlePointerDown,
    handleMouseOver: handlePointerMove,
    handleMouseUp: handlePointerUp,
    handleGlobalMouseUp: handleGlobalPointerUp
  }
} 