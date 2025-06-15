import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import CustomSwitch from '@/components/ui/custom-switch'
import { TimePicker } from '@/components/ui/time-picker'
import { useEventStore } from '@/store/useEventStore'
import { InteractiveCalendar } from '@/components/InteractiveCalendar'
import { Copy, Check } from 'lucide-react'

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const { createEvent, isLoading, error, clearError } = useEventStore()
  
  // 页面加载时清除任何残留的错误状态
  useEffect(() => {
    clearError()
  }, [])
  
  // 生成随机TimeeCode - 增强随机性避免重复
  const [roomId] = useState(() => {
    // 使用时间戳 + 随机数确保唯一性
    const timestamp = Date.now().toString().slice(-3) // 取时间戳后3位
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0') // 3位随机数
    return timestamp + random // 6位数字组合
  })
  
  const [copied, setCopied] = useState(false)
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [activityName, setActivityName] = useState('')
  const [includeTime, setIncludeTime] = useState(false)
  const [timezone, setTimezone] = useState('UTC+8')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')

  // 复制房间号
  const handleCopyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(`TC-${roomId}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 创建活动
  const handleCreateActivity = async () => {
    if (selectedDates.length === 0) {
      alert('请至少选择一个日期')
      return
    }

    try {
      clearError()
      
      // 将选中的日期转换为YYYY-MM-DD格式的字符串数组
      const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime())
      const selectedDateStrings = sortedDates.map(date => date.toISOString().split('T')[0])
      
      // 保留startDate和endDate作为兼容性字段（用于数据库约束等）
      const startDate = sortedDates[0].toISOString().split('T')[0]
      const endDate = sortedDates[sortedDates.length - 1].toISOString().split('T')[0]

      // 创建事件数据，如果没有输入活动名称则使用默认名称
      const eventData = {
        title: activityName.trim() || `活动 ${roomId}`, // 使用活动内容或默认名称作为标题
        description: activityName.trim(), // 活动内容作为描述
        startDate,
        endDate,
        selectedDates: selectedDateStrings, // 传递用户选择的具体日期
        startTime: includeTime ? startTime : '00:00',
        endTime: includeTime ? endTime : '23:59',
        timezone: includeTime ? timezone : 'UTC+8',
        eventType: 'group' as const,
        includeTime: includeTime,
        customTCode: `tc-${roomId}` // 使用页面显示的T-Code
      }

      const eventId = await createEvent(eventData)
      // createEvent返回的就是完整的T-Code格式
      navigate(`/event/${eventId}`)
      
    } catch (error) {
      console.error('创建活动失败:', error)
    }
  }

  return (
    <>
      {/* 全屏背景层 - 完全突破所有容器限制 */}
      <div className="fixed inset-0 bg-slate-50 -z-50" />
      
      <div className="relative -m-6 lg:-m-10 min-h-screen">
        {/* 额外的背景保险层 */}
        <div className="absolute inset-0 bg-slate-50 -z-40" />
        
        <div className="relative z-10 p-6 lg:p-10 min-h-screen flex flex-col">
          {/* 顶部TimeeCode - 平衡的立体感 */}
          <div className="text-center pt-4 pb-6">
            <div className="inline-flex flex-col items-center bg-white/85 backdrop-blur-xl rounded-2xl px-10 py-5 shadow-lg shadow-black/8 border border-white/40 relative overflow-hidden">
              {/* 内部光晕效果 */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-2xl"></div>
              
              {/* 边缘高光 */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/40"></div>
              
              {/* 内容区域 */}
              <div className="relative z-10">
                <span className="text-sm font-medium text-gray-600 tracking-wide mb-2 block text-center">
                  <span className="text-emerald-600">T</span>imee <span className="text-emerald-600">C</span>ode
                </span>
                <div className="flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-mono text-gray-900 tracking-widest">TC-{roomId}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyRoomId}
                      className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900 hover:bg-white/50 hover:shadow-md transition-all duration-200 rounded-lg"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 主体内容 - Apple风格布局 */}
          <div className="flex-1 flex items-start justify-center px-6 pt-8 min-h-0">
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* 左栏 - 日历 */}
              <div className="flex justify-center">
                <div className="w-full max-w-md">
                  <InteractiveCalendar
                    selectedDates={selectedDates}
                    onDatesChange={setSelectedDates}
                    maxDays={7}
                    className="aspect-[4/5] bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl shadow-black/5"
                  />
                </div>
              </div>

              {/* 右栏 - 信息控制台 */}
              <div className="flex justify-center">
                <div className="w-full max-w-md">
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-xl shadow-black/5 aspect-[4/5] flex flex-col">
                    <h2 className="text-2xl font-medium text-gray-900 mb-6 text-center tracking-wide">Timee 设置</h2>
                    
                    <div className="flex-1 space-y-6 min-h-0">
                      {/* 活动内容 */}
                      <div className="space-y-2">
                        <Label htmlFor="activityName" className="text-sm text-gray-600 tracking-wide">
                          活动内容（可选）
                        </Label>
                        <div className="relative">
                          <Input
                            id="activityName"
                            value={activityName}
                            onChange={(e) => setActivityName(e.target.value)}
                            placeholder="输入活动内容..."
                            className="w-full h-11 text-base bg-white/60 border-0 rounded-xl focus:ring-1 focus:ring-gray-300/50 focus:bg-white/80 transition-all duration-300 ease-out placeholder:text-gray-400/70 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.05)] hover:bg-white/70 hover:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.08)]"
                          />
                        </div>
                      </div>

                      {/* 活动类型开关 */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm text-gray-600 tracking-wide -mt-1">活动类型</Label>
                            <p className="text-xs text-gray-400 mt-1 font-light">
                              {includeTime ? '日期+时间' : '仅日期'}
                            </p>
                          </div>
                          <CustomSwitch
                            checked={includeTime}
                            onChange={setIncludeTime}
                          />
                        </div>
                      </div>

                      {/* 条件显示：时区和时间范围 */}
                      {includeTime && (
                        <div className="space-y-6">
                          {/* 时区选择 */}
                          <div className="space-y-2">
                            <Label className="text-sm text-gray-600 tracking-wide">时区</Label>
                            <Select value={timezone} onValueChange={setTimezone}>
                              <SelectTrigger className="text-sm h-11 bg-gray-50/50 border-gray-200/50 rounded-xl">
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
                          </div>

                          {/* 时间范围 */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm text-gray-600 tracking-wide">开始时间</Label>
                              <TimePicker
                                value={startTime}
                                onChange={setStartTime}
                                className="h-11 bg-gray-50/50 border-gray-200/50 rounded-xl"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm text-gray-600 tracking-wide">结束时间</Label>
                              <TimePicker
                                value={endTime}
                                onChange={setEndTime}
                                className="h-11 bg-gray-50/50 border-gray-200/50 rounded-xl"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 底部按钮 */}
                    <div className="pt-6 border-t border-gray-100/50">
                      <Button
                        onClick={handleCreateActivity}
                        disabled={isLoading || selectedDates.length === 0}
                        className="w-full h-12 text-white font-medium rounded-lg transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed border-0 hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          backgroundColor: isLoading || selectedDates.length === 0 
                            ? '#9CA3AF' // 灰色 - 禁用状态
                            : '#000000' // 纯黑 - 可点击状态
                        }}
                      >
                        {isLoading ? '创建中...' : '创建活动'}
                      </Button>
                      {error && (
                        <p className="text-red-500 text-sm mt-4">{error}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 