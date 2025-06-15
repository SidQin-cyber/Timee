import React from 'react'
import { cn } from '@/lib/utils'

interface DateHeatmapProps {
  dates: string[]
  formatDateDisplay: (dateStr: string) => { weekday: string; formattedDate: string }
  getDateDetails: (date: string) => { count: number, totalParticipants: number }
  onDateHover?: (date: string | null, position?: { x: number; y: number }) => void
  hoveredDate?: string | null
}

export const DateHeatmap: React.FC<DateHeatmapProps> = ({
  dates,
  formatDateDisplay,
  getDateDetails,
  onDateHover,
  hoveredDate
}) => {
  // 获取颜色映射 - 基于参与人数
  const getColorForCount = (count: number): string => {
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
    return colorMap[count] || 'bg-[#0369a1]' // 7+人都用最深色
  }

  return (
    <div className="space-y-2">
      {dates.map((date, index) => {
        const { weekday, formattedDate } = formatDateDisplay(date)
        const { count: participantCount, totalParticipants } = getDateDetails(date)
        const isHovered = hoveredDate === date
        
        return (
          <div
            key={index}
            className={cn(
              "flex items-center p-4 rounded-xl cursor-pointer select-none relative group transform transition-all duration-200 ease-out",
              getColorForCount(participantCount),
              {
                'hover:shadow-md hover:scale-[1.02] active:scale-[0.98]': participantCount > 0,
                'hover:bg-emerald-50': participantCount === 0,
                'shadow-lg scale-105': isHovered,
              }
            )}
            onMouseEnter={(e) => {
              if (onDateHover) {
                const rect = e.currentTarget.getBoundingClientRect()
                onDateHover(date, {
                  x: rect.left + rect.width / 2,
                  y: rect.top
                })
              }
            }}
            onMouseLeave={() => onDateHover?.(null)}
            title={`${date} - ${participantCount}/${totalParticipants} 人可行`}
          >
            <div className="flex items-center space-x-3 flex-1">
              <div className="text-left">
                <div className={cn(
                  "text-sm font-medium transition-colors duration-200",
                  participantCount >= 5 ? "text-white" : "text-blue-600"
                )}>
                  {weekday}
                </div>
                <div className={cn(
                  "text-xl font-bold transition-colors duration-200",
                  participantCount >= 5 ? "text-white" : "text-gray-900"
                )}>
                  {formattedDate}
                </div>
              </div>
            </div>
            
            {/* 参与人数指示器 - 只在2人及以上时显示，位置调整到右侧 */}
            {participantCount >= 2 && (
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ml-3",
                participantCount >= 5 ? "text-white" : "text-gray-600"
              )}>
                {participantCount}
              </div>
            )}
            
            {/* 微妙的悬浮效果指示器 */}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl" />
          </div>
        )
      })}
    </div>
  )
} 