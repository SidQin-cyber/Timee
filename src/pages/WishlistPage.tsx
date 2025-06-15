import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EmailService, type EmailResponse } from '@/services/emailService'

export const WishlistPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [emailResponse, setEmailResponse] = useState<EmailResponse | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setEmailResponse(null)

    try {
      // 验证邮箱格式（如果提供了邮箱）
      if (formData.email && !EmailService.isValidEmail(formData.email)) {
        setEmailResponse({
          success: false,
          message: '请输入有效的邮箱地址',
          error: 'INVALID_EMAIL'
        })
        return
      }

      // 构建详细的邮件内容
      const detailedMessage = `
功能许愿池反馈

基本信息：
- 姓名：${formData.name || '未提供'}
- 邮箱：${formData.email || '未提供'}
- 功能主题：${formData.subject}

详细描述：
${formData.message}

---
提交时间：${new Date().toLocaleString('zh-CN', { 
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
})}
来源：Timee 功能许愿池
用户代理：${navigator.userAgent}
      `.trim()

      // 使用 EmailJS 发送邮件
      const response = await EmailService.sendEmail({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: detailedMessage
      })

      setEmailResponse(response)

      if (response.success) {
        // 显示成功状态
        setSubmitted(true)
        
        // 重置表单
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        })
      }
      
    } catch (error) {
      console.error('发送失败:', error)
      setEmailResponse({
        success: false,
        message: '发送过程中出现未知错误，请稍后重试',
        error: 'UNKNOWN_ERROR'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = formData.subject.trim() && formData.message.trim()

  if (submitted) {
    return (
      <div className="h-full bg-gray-50/30 flex flex-col relative">
        {/* 背景涂层 - 与sidebar颜色一致 */}
        <div className="fixed inset-0 -z-10" style={{ backgroundColor: '#f8fafc' }} />
        
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          <div className="space-y-8">
            {/* 成功图标 */}
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-3xl font-light text-gray-900 tracking-tight">
                感谢您的反馈
              </h1>
              <p className="text-lg text-gray-500 font-light leading-relaxed">
                您的建议已成功发送到我们的邮箱。我们会仔细阅读每一条建议，并在后续版本中考虑实现。
              </p>
            </div>

            <Button
              onClick={() => setSubmitted(false)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2 rounded-xl font-medium transition-colors duration-200"
            >
              继续提交建议
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-gray-50/30 flex flex-col relative">
      {/* 背景涂层 - 与sidebar颜色一致 */}
      <div className="fixed inset-0 -z-10" style={{ backgroundColor: '#f8fafc' }} />
      
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* 标题区域 */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-light text-gray-900 tracking-tight mb-4">
            功能许愿池
          </h1>
          <p className="text-lg text-gray-500 font-light leading-relaxed">
            分享您的创意，让 Timee 变得更好
          </p>
        </div>

        {/* 表单区域 */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl shadow-black/5">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 基本信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm text-gray-600 tracking-wide">
                  姓名（可选）
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="您的姓名"
                  className="w-full h-11 text-base bg-white/60 border-0 rounded-xl focus:ring-1 focus:ring-gray-300/50 focus:bg-white/80 transition-all duration-300 ease-out placeholder:text-gray-400/70 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.05)] hover:bg-white/70 hover:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.08)]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-gray-600 tracking-wide">
                  邮箱（可选）
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className="w-full h-11 text-base bg-white/60 border-0 rounded-xl focus:ring-1 focus:ring-gray-300/50 focus:bg-white/80 transition-all duration-300 ease-out placeholder:text-gray-400/70 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.05)] hover:bg-white/70 hover:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.08)]"
                />
              </div>
            </div>

            {/* 主题 */}
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-sm text-gray-600 tracking-wide">
                功能主题 <span className="text-red-400">*</span>
              </Label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="简要描述您希望的功能..."
                required
                className="w-full h-11 text-base bg-white/60 border-0 rounded-xl focus:ring-1 focus:ring-gray-300/50 focus:bg-white/80 transition-all duration-300 ease-out placeholder:text-gray-400/70 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.05)] hover:bg-white/70 hover:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.08)]"
              />
            </div>

            {/* 详细描述 */}
            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm text-gray-600 tracking-wide">
                详细描述 <span className="text-red-400">*</span>
              </Label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="详细描述您的功能需求、使用场景、期望效果等..."
                required
                rows={6}
                className="w-full text-base bg-white/60 border-0 rounded-xl focus:ring-1 focus:ring-gray-300/50 focus:bg-white/80 transition-all duration-300 ease-out placeholder:text-gray-400/70 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.05)] hover:bg-white/70 hover:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.08)] resize-none p-4"
              />
            </div>

            {/* 错误提示 */}
            {emailResponse && !emailResponse.success && (
              <div className="bg-red-50/80 border border-red-200/50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-red-800">发送失败</p>
                    <p className="text-sm text-red-700">{emailResponse.message}</p>
                    {emailResponse.error === 'EMAILJS_NOT_CONFIGURED' && (
                      <p className="text-xs text-red-600 mt-2">
                        提示：EmailJS 服务尚未配置完成，请联系管理员
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 提交按钮 */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className={`w-full h-12 rounded-xl font-medium transition-all duration-300 ${
                  isFormValid && !isSubmitting
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    发送中...
                  </div>
                ) : (
                  '发送许愿'
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* 底部说明 */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200/50">
          <div className="space-y-4">
            <h3 className="text-lg font-light text-gray-900">
              我们重视每一个建议
            </h3>
            <p className="text-gray-500 font-light max-w-xl mx-auto leading-relaxed text-sm">
              您的建议将直接发送到开发团队邮箱。我们会仔细评估每个功能建议，
              并在可能的情况下在后续版本中实现。感谢您帮助 Timee 变得更好！
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 