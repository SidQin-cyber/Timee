import { useCallback } from 'react'
import type { UserResponse } from '../store/useEventStore'

interface UseDataSeparationProps {
  participants: UserResponse[]
  getHeatmapIntensity: (dateIndex: number, timeIndex: number) => number
  currentEvent: any
  timeGrid: any
  dates: string[]
  selectedDates: Set<string>
  participantName: string
}

export const useDataSeparation = ({
  participants,
  getHeatmapIntensity,
  currentEvent,
  timeGrid,
  dates,
  selectedDates,
  participantName
}: UseDataSeparationProps) => {
  
  // 服务端数据强度（其他人的选择）
  const getServerIntensity = useCallback((dateIndex: number, timeIndex: number): number => {
    const intensity = getHeatmapIntensity(dateIndex, timeIndex)
    return Math.round(intensity * participants.length)
  }, [participants.length, getHeatmapIntensity])
  
  // 本地数据强度（当前用户的选择）
  const getLocalIntensity = useCallback((dateIndex: number, timeIndex: number): number => {
    if (!participantName.trim()) return 0
    
    if (currentEvent?.includeTime) {
      // 时间模式：检查时间网格选择
      return timeGrid?.isSlotSelected?.(dateIndex, timeIndex) ? 1 : 0
    } else {
      // 仅日期模式：检查日期选择（只在timeIndex=0时计算）
      if (timeIndex === 0) {
        const date = dates[dateIndex]
        return selectedDates.has(date) ? 1 : 0
      }
      return 0
    }
  }, [currentEvent?.includeTime, timeGrid, dates, selectedDates, participantName])
  
  // 合并计算总强度
  const getTotalIntensity = useCallback((dateIndex: number, timeIndex: number): number => {
    const serverCount = getServerIntensity(dateIndex, timeIndex)
    const localCount = getLocalIntensity(dateIndex, timeIndex)
    return serverCount + localCount
  }, [getServerIntensity, getLocalIntensity])
  
  // 获取总参与者数量（包括当前用户）
  const getTotalParticipants = useCallback((): number => {
    return participants.length + (participantName.trim() ? 1 : 0)
  }, [participants.length, participantName])
  
  // 获取强度比例（0-1之间）
  const getIntensityRatio = useCallback((dateIndex: number, timeIndex: number): number => {
    const totalCount = getTotalIntensity(dateIndex, timeIndex)
    const totalParticipants = getTotalParticipants()
    
    if (totalParticipants === 0) return 0
    return totalCount / totalParticipants
  }, [getTotalIntensity, getTotalParticipants])
  
  // 仅日期模式的日期强度计算
  const getDateIntensity = useCallback((date: string): number => {
    const dateIndex = dates.indexOf(date)
    if (dateIndex === -1) return 0
    
    return getIntensityRatio(dateIndex, 0)
  }, [dates, getIntensityRatio])
  
  return {
    // 基础数据
    getServerIntensity,
    getLocalIntensity,
    getTotalIntensity,
    getTotalParticipants,
    
    // 计算结果
    getIntensityRatio,
    getDateIntensity,
    
    // 状态检查
    hasLocalSelection: (dateIndex: number, timeIndex: number) => getLocalIntensity(dateIndex, timeIndex) > 0,
    hasServerData: (dateIndex: number, timeIndex: number) => getServerIntensity(dateIndex, timeIndex) > 0
  }
} 