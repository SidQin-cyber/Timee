import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EventService } from '@/services/eventService'

export const JoinByLinkPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [eventLink, setEventLink] = useState('')
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

  // 如果有eventId，直接验证并跳转
  useEffect(() => {
    if (eventId) {
      validateAndJump(eventId)
    }
  }, [eventId])

  const validateAndJump = async (id: string) => {
    setIsLoading(true)
    try {
      const event = await EventService.getEvent(id)
      if (event) {
        // 直接跳转，不显示中间状态
        navigate(`/event/${id}`)
      } else {
        setNotFound(true)
      }
    } catch (err) {
      console.error('验证活动失败:', err)
      
      // 区分错误类型
      if (err instanceof Error) {
        if (err.message.includes('网络连接失败')) {
          setNetworkError(true)
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

  // 验证链接格式并提取eventId
  const validateAndExtractEventId = (link: string): string | null => {
    try {
      const trimmedLink = link.trim()
      
      // 支持的链接格式（仅链接，不支持直接T-Code）
      const patterns = [
        // 完整链接：https://timee.app/event/tc-123456
        /^https?:\/\/[^\/]+\/event\/(tc-\d{6})$/i,
        // 相对路径：/event/tc-123456
        /^\/event\/(tc-\d{6})$/i
      ]

      for (const pattern of patterns) {
        const match = trimmedLink.match(pattern)
        if (match) {
          return match[1].toLowerCase()
        }
      }
      
      return null
    } catch {
      return null
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEventLink(value)
    setError('')
    setNotFound(false)
    setNetworkError(false)
  }

  const handleJoinByLink = async () => {
    if (!eventLink.trim()) {
      setError('请输入活动链接')
      return
    }

    const extractedEventId = validateAndExtractEventId(eventLink)
    if (!extractedEventId) {
      setError('链接格式不正确')
      return
    }

    setIsLoading(true)
    setError('')
    setNotFound(false)
    setNetworkError(false)

    try {
      const event = await EventService.getEvent(extractedEventId)
      if (event) {
        // 找到活动，直接跳转
        navigate(`/event/${extractedEventId}`)
      } else {
        setNotFound(true)
      }
    } catch (err) {
      console.error('验证活动失败:', err)
      
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

  const handleBackToHome = () => {
    navigate('/')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJoinByLink()
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

  // 如果有eventId但正在验证
  if (eventId && isLoading) {
    return (
      <div className="h-full bg-gray-50/30 flex flex-col relative">
        <div className="fixed inset-0 -z-10" style={{ backgroundColor: '#f8fafc' }} />
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-3 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-light">验证活动中...</p>
          </div>
        </div>
      </div>
    )
  }

  // 如果有eventId但网络错误
  if (eventId && networkError) {
    return (
      <div className="h-full bg-gray-50/30 flex flex-col relative">
        <div className="fixed inset-0 -z-10" style={{ backgroundColor: '#f8fafc' }} />
        
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-sm mx-auto">
            <div className="bg-orange-50/80 border border-orange-200/50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-4 h-4 bg-orange-500 rounded-full flex-shrink-0"></div>
                <p className="text-sm text-orange-700 font-medium">网络连接失败</p>
              </div>
              
              <div className="space-y-2">
                <Button
                  onClick={() => validateAndJump(eventId!)}
                  className="w-full h-10 text-white font-medium rounded-lg transition-all duration-200 ease-out border-0 hover:scale-[1.02] active:scale-[0.98] text-sm"
                  style={{
                    backgroundColor: '#000000' // 纯黑
                  }}
                >
                  重试
                </Button>
                <Button
                  onClick={handleBackToHome}
                  className="w-full h-10 text-gray-600 font-medium rounded-lg transition-all duration-200 ease-out border border-gray-300 hover:scale-[1.02] active:scale-[0.98] bg-white text-sm"
                >
                  返回主页
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 如果有eventId但验证失败
  if (eventId && notFound) {
    return (
      <div className="h-full bg-gray-50/30 flex flex-col relative">
        <div className="fixed inset-0 -z-10" style={{ backgroundColor: '#f8fafc' }} />
        
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-sm mx-auto text-center">
                         {/* 友好的提示，无边框无红点 */}
             <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg shadow-black/5 border border-white/20">
               <div className="space-y-4">
                 <div className="space-y-2">
                   <p className="text-gray-700 font-medium">活动不存在</p>
                   <p className="text-sm text-gray-500 font-light">
                     该活动可能已结束或链接有误
                   </p>
                 </div>
                
                <Button
                  onClick={handleBackToHome}
                  className="w-full h-10 text-white font-medium rounded-lg transition-all duration-200 ease-out border-0 hover:scale-[1.02] active:scale-[0.98] text-sm"
                  style={{
                    backgroundColor: '#000000' // 纯黑
                  }}
                >
                  返回主页
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 如果没有eventId，显示输入链接界面
  return (
    <div className="h-full bg-gray-50/30 flex flex-col relative">
      <div className="fixed inset-0 -z-10" style={{ backgroundColor: '#f8fafc' }} />
      
      <div className="space-y-8 pt-16">
        {/* 简化的标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            通过链接加入
          </h1>
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl shadow-black/5">
            <div className="space-y-4">
              {/* 输入框区域 */}
              <div className="space-y-2">
                <Label htmlFor="eventLink" className="text-sm text-gray-600 tracking-wide">
                  活动链接
                </Label>
                                  <Input
                    id="eventLink"
                    value={eventLink}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="粘贴活动链接"
                    className={getInputClassName()}
                  />
                
                {/* 格式错误提示 */}
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
                      onClick={handleJoinByLink}
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
                    <p className="text-sm text-gray-600 font-medium">活动不存在，请检查链接</p>
                  </div>
                </div>
              </div>

              {/* 加入按钮 */}
              <Button
                onClick={handleJoinByLink}
                disabled={isLoading || !eventLink.trim()}
                className="w-full h-12 text-white font-medium rounded-lg transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed border-0 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: isLoading || !eventLink.trim()
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
              <div className="text-center">
                <p className="text-xs text-gray-500 font-light mb-2">支持的格式：</p>
                <div className="text-xs text-gray-500 space-y-1 font-light">
                  <p>完整链接：https://timee.app/event/tc-123456</p>
                  <p>相对路径：/event/tc-123456</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}