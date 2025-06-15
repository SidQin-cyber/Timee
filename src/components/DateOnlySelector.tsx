import React from 'react'
import { cn } from '@/lib/utils'

interface DateOnlySelectorProps {
  dates: string[]
  selectedDates: Set<string>
  onDateToggle: (date: string) => void
  paintMode: 'available' | 'unavailable'
  formatDateDisplay: (dateStr: string) => { weekday: string; formattedDate: string }
}

export const DateOnlySelector: React.FC<DateOnlySelectorProps> = ({
  dates,
  selectedDates,
  onDateToggle,
  paintMode,
  formatDateDisplay,
}) => {
  return (
    <div className="space-y-2">
      {dates.map((date, index) => {
        const { weekday, formattedDate } = formatDateDisplay(date)
        const isSelected = selectedDates.has(date)
        
        return (
          <div
            key={index}
            onClick={() => onDateToggle(date)}
            className={cn(
              "flex items-center p-4 rounded-xl cursor-pointer select-none relative group transform transition-all duration-200 ease-out",
              {
                // 默认状态 - 现代扁平风格，hover时使用品牌色
                'bg-gray-50/80 hover:bg-emerald-50/90 border border-gray-200/50 hover:border-emerald-200/60 hover:scale-[1.02] active:scale-[0.98]': !isSelected,
                
                // 选中状态 - 高级扁平风格
                'bg-emerald-500/90 hover:bg-emerald-500 border border-emerald-500/50 hover:border-emerald-600/60 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]': isSelected && paintMode === 'available',
                'bg-red-600/90 hover:bg-red-600 border border-red-600/50 hover:border-red-700/60 shadow-lg shadow-red-600/20 hover:scale-[1.02] active:scale-[0.98]': isSelected && paintMode === 'unavailable',
              }
            )}
          >
            <div className="flex items-center space-x-3 flex-1">
              <div className="text-left">
                <div className={cn(
                  "text-sm font-medium transition-colors duration-200",
                  isSelected ? "text-white/95" : "text-blue-600/90 group-hover:text-emerald-600"
                )}>
                  {weekday}
                </div>
                <div className={cn(
                  "text-xl font-bold transition-colors duration-200",
                  isSelected ? "text-white/95" : "text-gray-900/90 group-hover:text-emerald-700"
                )}>
                  {formattedDate}
                </div>
              </div>
            </div>
            
            {/* 微妙的悬浮效果指示器 */}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl" />
            
            {/* 选中状态的微妙光晕效果 */}
            {isSelected && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50 rounded-xl" />
            )}
          </div>
        )
      })}
    </div>
  )
} 