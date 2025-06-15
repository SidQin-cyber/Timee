import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EventService } from '@/services/eventService'

export const JoinByCodePage: React.FC = () => {
  const navigate = useNavigate()
  const [tCode, setTCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [networkError, setNetworkError] = useState(false)

  // 自动消失的提示
  useEffect(() => {
    if (notFound) {
      const timer = setTimeout(() => {
        setNotFound(false)
      }, 3000) // 3秒后自动消失
      return () => clearTimeout(timer)
    }
  }, [notFound])

  // 验证T-Code格式
  const validateTCode = (code: string): boolean => {
    const tCodeRegex = /^TC-\d{6}$/i
    return tCodeRegex.test(code.trim())
  }

  // 格式化T-Code输入
  const formatTCode = (input: string): string => {
    // 移除所有非数字和非字母字符，转换为大写
    const cleaned = input.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
    
    // 如果输入不以TC开头，自动添加
    if (cleaned.length > 0 && !cleaned.startsWith('TC')) {
      // 如果是纯数字，添加TC前缀
      if (/^\d+$/.test(cleaned)) {
        return `TC-${cleaned.slice(0, 6)}`
      }
      // 如果以T开头但不是TC，替换为TC
      if (cleaned.startsWith('T') && !cleaned.startsWith('TC')) {
        return `TC-${cleaned.slice(1, 7)}`
      }
    }
    
    // 如果已经是TC开头，格式化为TC-XXXXXX
    if (cleaned.startsWith('TC')) {
      const numbers = cleaned.slice(2, 8) // 取TC后面的6位数字
      if (numbers.length > 0) {
        return `TC-${numbers}`
      }
    }
    
    return cleaned
  }

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const formatted = formatTCode(value)
    setTCode(formatted)
    setError('')
    setNotFound(false)
    setNetworkError(false)
  }

  // 验证活动是否存在（直接调用服务，不影响全局状态）
  const validateEventExists = async (eventId: string): Promise<boolean> => {
    try {
      const event = await EventService.getEvent(eventId)
      return !!event
    } catch (error) {
      return false
    }
  }

  // 处理加入活动
  const handleJoinEvent = async () => {
    if (!tCode.trim()) {
      setError('请输入T-Code')
      return
    }

    if (!validateTCode(tCode)) {
      setError('格式不正确，请输入TC-六位数字')
      return
    }

    setIsLoading(true)
    setError('')
    setNotFound(false)
    setNetworkError(false)

    try {
      const eventId = tCode.toLowerCase()
      
      // 验证活动是否存在
      const exists = await validateEventExists(eventId)
      if (exists) {
        // 找到活动，直接跳转
        navigate(`/event/${eventId}`)
      } else {
        setNotFound(true)
      }
    } catch (err) {
      console.error('加入活动失败:', err)
      
      // 区分错误类型
      if (err instanceof Error) {
        if (err.message.includes('网络连接失败')) {
          setNetworkError(true)
        } else if (err.message.includes('数据库查询失败')) {
          setError('服务器暂时不可用，请稍后重试')
        } else {
          setNotFound(true)
        }
      } else {
        setNotFound(true)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // 处理键盘回车
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJoinEvent()
    }
  }

  // 获取输入框样式（格式错误时添加红色边框和微震动画）
  const getInputClassName = () => {
    const baseClass = "w-full h-11 text-base bg-white/60 border-0 rounded-xl focus:ring-1 focus:bg-white/80 transition-all duration-300 ease-out placeholder:text-gray-400/70 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.05)] hover:bg-white/70 hover:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.08)]"
    
    if (error) {
      return `${baseClass} ring-2 ring-red-600/70 focus:ring-red-600/70 animate-[shake_0.5s_ease-in-out]`
    }
    
    return `${baseClass} focus:ring-emerald-300/50`
  }

  return (
    <div className="h-full bg-gray-50/30 flex flex-col relative">
      {/* 背景涂层 - 与sidebar颜色一致 */}
      <div className="fixed inset-0 -z-10" style={{ backgroundColor: '#f8fafc' }} />
      
      <div className="space-y-8 pt-16">
        {/* 简化的标题 - 移除副标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            通过T-Code加入
          </h1>
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl shadow-black/5">
            <div className="space-y-4">
              {/* 输入框区域 */}
              <div className="space-y-2">
                <Label htmlFor="tCode" className="text-sm text-gray-600 tracking-wide">
                  T-Code
                </Label>
                <Input
                  id="tCode"
                  value={tCode}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="TC-123456"
                  className={getInputClassName()}
                />
                
                {/* 格式错误提示 - 输入框下方小字 */}
                {error && (
                  <p className="text-xs text-red-700 mt-1 font-light animate-pulse">
                    {error}
                  </p>
                )}
              </div>

              {/* 网络错误反馈 - 极简橙色提示，带重试功能 */}
              {networkError && (
                <div className="bg-orange-50/80 border border-orange-200/50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-orange-500 rounded-full flex-shrink-0"></div>
                      <p className="text-sm text-orange-700 font-medium">网络连接失败</p>
                    </div>
                    <button
                      onClick={handleJoinEvent}
                      className="text-xs text-orange-600 hover:text-orange-800 font-medium underline"
                    >
                      重试
                    </button>
                  </div>
                </div>
              )}

              {/* 友好的提示 - 居中显示在按钮上方 */}
              <div className={`transition-all duration-500 ease-out overflow-hidden ${
                notFound ? 'max-h-16 opacity-100 mb-4' : 'max-h-0 opacity-0 mb-0'
              }`}>
                <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-3">
                  <div className="flex items-center justify-center">
                    <p className="text-sm text-gray-600 font-medium">活动不存在，请检查T-Code</p>
                  </div>
                </div>
              </div>

              {/* 加入按钮 - OpenAI风格 */}
              <Button
                onClick={handleJoinEvent}
                disabled={isLoading || !tCode.trim()}
                className="w-full h-12 text-white font-medium rounded-lg transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed border-0 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: isLoading || !tCode.trim()
                    ? '#9CA3AF' // 灰色 - 禁用状态
                    : '#000000' // 纯黑 - 可点击状态
                }}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    验证中...
                  </div>
                ) : '加入活动'}
              </Button>

              {/* 格式参考提示 - 简化为纯文字 */}
              <p className="text-xs text-gray-500 text-center font-light">
                T-Code格式：TC-XXXXXX（6位数字）
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 