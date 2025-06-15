import React, { useState, useCallback, useRef, useEffect } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'

interface InteractiveCalendarProps {
  selectedDates: Date[]
  onDatesChange: (dates: Date[]) => void
  className?: string
  maxDays?: number
}

export const InteractiveCalendar: React.FC<InteractiveCalendarProps> = ({
  selectedDates,
  onDatesChange,
  className = '',
  maxDays = 7
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<Date | null>(null)
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [showYearPicker, setShowYearPicker] = useState(false)
  const [dragMoved, setDragMoved] = useState(false) // 追踪是否真的拖拽了
  const [draggedDates, setDraggedDates] = useState<Date[]>([]) // 追踪拖拽过程中划过的所有日期
  const [dragMode, setDragMode] = useState<'select' | 'deselect' | null>(null) // 拖拽模式：选择还是取消选择
  const calendarRef = useRef<HTMLDivElement>(null)

  // 获取月份的所有日期
  const getDaysInMonth = useCallback((date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []

    // 添加上个月的空白日期
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // 添加当月的日期
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }, [])

  // 检查日期是否被选中
  const isDateSelected = useCallback((date: Date) => {
    return selectedDates.some(selectedDate => 
      selectedDate.toDateString() === date.toDateString()
    )
  }, [selectedDates])

  // 检查日期在拖拽预览中的状态
  const getDateDragPreviewState = useCallback((date: Date) => {
    if (!isDragging) return null
    
    const isInDragRange = draggedDates.some(draggedDate => 
      draggedDate.toDateString() === date.toDateString()
    )
    
    if (!isInDragRange) return null
    
    // const isCurrentlySelected = isDateSelected(date)
    
    if (dragMode === 'select') {
      return 'will-select' // 将要被选中
    } else if (dragMode === 'deselect') {
      return 'will-deselect' // 将要被取消选择
    }
    
    return null
  }, [isDragging, draggedDates, dragMode, isDateSelected])

  // 处理鼠标按下
  const handleMouseDown = useCallback((date: Date) => {
    setIsDragging(true)
    setDragStart(date)
    setDragMoved(false)
    setDraggedDates([date])
    
    // 根据起始日期的当前状态决定拖拽模式
    const isCurrentlySelected = isDateSelected(date)
    setDragMode(isCurrentlySelected ? 'deselect' : 'select')
  }, [isDateSelected])

  // 处理鼠标进入
  const handleMouseEnter = useCallback((date: Date) => {
    if (isDragging && dragStart) {
      // 如果鼠标移动到了不同的日期，标记为已拖拽
      if (date.toDateString() !== dragStart.toDateString()) {
        setDragMoved(true)
      }
      
      // 将当前日期添加到拖拽日期列表中（如果还没有的话）
      setDraggedDates(prev => {
        const dateString = date.toDateString()
        const alreadyExists = prev.some(d => d.toDateString() === dateString)
        if (!alreadyExists) {
          return [...prev, date]
        }
        return prev
      })
    }
  }, [isDragging, dragStart])

  // 处理鼠标释放
  const handleMouseUp = useCallback(() => {
    if (isDragging && dragStart) {
      if (dragMoved) {
        // 如果真的拖拽了，根据拖拽模式处理所有划过的日期
        let newSelectedDates = [...selectedDates]
        
        if (dragMode === 'select') {
          // 选择模式：添加所有拖拽过的未选中日期
          draggedDates.forEach(date => {
            const isSelected = newSelectedDates.some(selectedDate =>
              selectedDate.toDateString() === date.toDateString()
            )
            
            if (!isSelected && newSelectedDates.length < maxDays) {
              newSelectedDates.push(date)
            }
          })
        } else if (dragMode === 'deselect') {
          // 取消选择模式：移除所有拖拽过的已选中日期
          draggedDates.forEach(date => {
            newSelectedDates = newSelectedDates.filter(selectedDate =>
              selectedDate.toDateString() !== date.toDateString()
            )
          })
        }
        
        onDatesChange(newSelectedDates)
      } else {
        // 如果没有拖拽，处理单击
        if (isDateSelected(dragStart)) {
          // 取消选择
          const newSelectedDates = selectedDates.filter(selectedDate =>
            selectedDate.toDateString() !== dragStart.toDateString()
          )
          onDatesChange(newSelectedDates)
        } else {
          // 添加选择 - 检查是否超过最大天数限制
          if (selectedDates.length < maxDays) {
            onDatesChange([...selectedDates, dragStart])
          }
        }
      }
    }
    
    setIsDragging(false)
    setDragStart(null)
    setDragMoved(false)
    setDraggedDates([])
    setDragMode(null)
  }, [isDragging, dragStart, dragMoved, draggedDates, dragMode, selectedDates, onDatesChange, isDateSelected, maxDays])

  // 全局鼠标释放事件
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleMouseUp()
      }
    }

    document.addEventListener('mouseup', handleGlobalMouseUp)
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [isDragging, handleMouseUp])

  // 阻止文本选择
  useEffect(() => {
    const handleSelectStart = (e: Event) => {
      if (isDragging) {
        e.preventDefault()
      }
    }

    document.addEventListener('selectstart', handleSelectStart)
    return () => document.removeEventListener('selectstart', handleSelectStart)
  }, [isDragging])

  // 导航到上个月
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  // 导航到下个月
  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  // 选择月份
  const selectMonth = (monthIndex: number) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), monthIndex, 1))
    setShowMonthPicker(false)
  }

  // 选择年份
  const selectYear = (year: number) => {
    setCurrentMonth(prev => new Date(year, prev.getMonth(), 1))
    setShowYearPicker(false)
  }

  // 点击月份显示月份选择器
  const handleMonthClick = () => {
    setShowMonthPicker(!showMonthPicker)
    setShowYearPicker(false)
  }

  // 点击年份显示年份选择器
  const handleYearClick = () => {
    setShowYearPicker(!showYearPicker)
    setShowMonthPicker(false)
  }

  // 重置选择并回到今天所在月份
  const handleReset = () => {
    onDatesChange([])
    // 导航回到今天所在的月份
    const today = new Date()
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1))
  }

  const days = getDaysInMonth(currentMonth)
  const currentYear = currentMonth.getFullYear()
  const currentMonthName = currentMonth.toLocaleDateString('en-US', { month: 'long' })

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]

  // 生成年份列表（当前年份前后各5年）
  const generateYears = () => {
    const years = []
    const startYear = currentYear - 5
    const endYear = currentYear + 5
    for (let year = startYear; year <= endYear; year++) {
      years.push(year)
    }
    return years
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-2xl shadow-sm p-6 relative ${className}`}>
      {/* 提示文字 */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 leading-relaxed">
          拖拽选择多个日期
        </p>
        {selectedDates.length >= maxDays && (
          <p className="text-xs text-amber-600 mt-2 leading-relaxed">
            已达到最多 {maxDays} 天限制，请先取消选择其他日期
          </p>
        )}
      </div>

      {/* 月份导航 */}
      <div className="relative flex items-center justify-center mb-8">
        {/* 左侧导航按钮 */}
        <button
          onClick={goToPreviousMonth}
          className="absolute left-0 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-7 w-7"
          type="button"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
        
        {/* 中央月份年份 - 始终居中 */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleMonthClick}
            className="text-xl font-semibold text-gray-900 hover:text-emerald-600 transition-colors"
            type="button"
          >
            {currentMonthName}
          </button>
          <button
            onClick={handleYearClick}
            className="text-xl font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
            type="button"
          >
            {currentYear}
          </button>
        </div>
        
        {/* 右侧按钮区域 - 固定宽度 */}
        <div className="absolute right-0 flex items-center space-x-2 w-20 justify-end">
          {selectedDates.length > 0 && (
                      <button
            onClick={handleReset}
            className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-all duration-200"
            type="button"
            title="重置选择"
          >
            重置
          </button>
          )}
          <button
            onClick={goToNextMonth}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-7 w-7"
            type="button"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 月份选择器 */}
      {showMonthPicker && (
        <div className="absolute top-20 left-6 right-6 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
          <div className="grid grid-cols-3 gap-2">
            {months.map((month, index) => (
              <button
                key={month}
                onClick={() => selectMonth(index)}
                className={`
                  p-3 text-sm font-medium rounded-xl transition-colors
                  ${index === currentMonth.getMonth()
                    ? 'bg-emerald-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
                type="button"
              >
                {month}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 年份选择器 */}
      {showYearPicker && (
        <div className="absolute top-20 left-6 right-6 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4 max-h-60 overflow-y-auto">
          <div className="grid grid-cols-3 gap-2">
            {generateYears().map((year) => (
              <button
                key={year}
                onClick={() => selectYear(year)}
                className={`
                  p-3 text-sm font-medium rounded-xl transition-colors
                  ${year === currentYear
                    ? 'bg-emerald-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
                type="button"
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 星期标题 */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {weekDays.map((day) => (
          <div
            key={day}
            className="h-10 flex items-center justify-center text-sm font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 日期网格 */}
      <div 
        ref={calendarRef}
        className="grid grid-cols-7 gap-3"
        onMouseLeave={() => {
          if (isDragging) {
            handleMouseUp()
          }
        }}
      >
        {days.map((date, index) => {
          if (!date) {
            return <div key={index} className="h-10" />
          }

          const isSelected = isDateSelected(date)
          const dragPreviewState = getDateDragPreviewState(date)
          const isToday = date.toDateString() === new Date().toDateString()
          const isMaxReached = selectedDates.length >= maxDays && !isSelected

          // 计算最终显示状态
          let finalState = 'default'
          if (isSelected && dragPreviewState !== 'will-deselect') {
            finalState = 'selected'
          } else if (dragPreviewState === 'will-select') {
            finalState = 'will-select'
          } else if (dragPreviewState === 'will-deselect') {
            finalState = 'will-deselect'
          }

          return (
            <button
              key={date.toDateString()}
              type="button"
              className={`
                inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 w-9
                select-none
                ${finalState === 'selected' 
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600 cursor-pointer' 
                  : finalState === 'will-select'
                  ? 'bg-emerald-400 text-white cursor-pointer' // 预览选中状态
                  : finalState === 'will-deselect'
                  ? 'bg-gray-300 text-gray-600 cursor-pointer' // 预览取消选择状态 - 浅灰色
                  : isMaxReached
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-900 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer'
                }
                ${isToday && finalState === 'default'
                  ? 'bg-gray-200 text-gray-900 font-bold shadow-md ring-2 ring-gray-300 ring-offset-1' 
                  : ''
                }
              `}
              onMouseDown={(e) => {
                e.preventDefault()
                if (!isMaxReached) {
                  handleMouseDown(date)
                }
              }}
              onMouseEnter={() => {
                if (!isMaxReached) {
                  handleMouseEnter(date)
                }
              }}
              disabled={isMaxReached}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>

      {/* 点击外部关闭选择器 */}
      {(showMonthPicker || showYearPicker) && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => {
            setShowMonthPicker(false)
            setShowYearPicker(false)
          }}
        />
      )}
    </div>
  )
} 