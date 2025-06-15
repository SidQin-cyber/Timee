import emailjs from '@emailjs/browser'
import { emailjsConfig, isEmailJSConfigured, type EmailTemplateParams } from '@/config/emailjs'

export interface SendEmailParams {
  name: string
  email: string
  subject: string
  message: string
}

export interface EmailResponse {
  success: boolean
  message: string
  error?: string
}

export class EmailService {
  /**
   * 发送邮件
   */
  static async sendEmail(params: SendEmailParams): Promise<EmailResponse> {
    try {
      // 检查EmailJS配置
      if (!isEmailJSConfigured()) {
        return {
          success: false,
          message: 'EmailJS 配置不完整，请检查环境变量设置',
          error: 'EMAILJS_NOT_CONFIGURED'
        }
      }

      // 准备邮件模板参数
      const templateParams: EmailTemplateParams = {
        from_name: params.name || '匿名用户',
        from_email: params.email || 'noreply@timee.app',
        subject: `[Timee 功能许愿池] ${params.subject}`,
        message: params.message,
        to_email: 'sidqin@163.com', // 接收邮件的地址
        reply_to: params.email || 'noreply@timee.app'
      }

      // 发送邮件
      const response = await emailjs.send(
        emailjsConfig.serviceId,
        emailjsConfig.templateId,
        templateParams,
        emailjsConfig.publicKey
      )

      if (response.status === 200) {
        return {
          success: true,
          message: '邮件发送成功！我们会仔细阅读您的建议。'
        }
      } else {
        return {
          success: false,
          message: '邮件发送失败，请稍后重试',
          error: `HTTP_${response.status}`
        }
      }

    } catch (error) {
      console.error('EmailJS发送失败:', error)
      
      // 处理不同类型的错误
      let errorMessage = '邮件发送失败，请稍后重试'
      let errorCode = 'UNKNOWN_ERROR'

      if (error instanceof Error) {
        if (error.message.includes('network')) {
          errorMessage = '网络连接失败，请检查网络后重试'
          errorCode = 'NETWORK_ERROR'
        } else if (error.message.includes('rate limit')) {
          errorMessage = '发送频率过高，请稍后重试'
          errorCode = 'RATE_LIMIT_ERROR'
        } else if (error.message.includes('template')) {
          errorMessage = '邮件模板配置错误，请联系管理员'
          errorCode = 'TEMPLATE_ERROR'
        }
      }

      return {
        success: false,
        message: errorMessage,
        error: errorCode
      }
    }
  }

  /**
   * 验证邮箱格式
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * 获取EmailJS配置状态
   */
  static getConfigStatus(): {
    configured: boolean
    missing: string[]
  } {
    const missing: string[] = []
    
    if (!emailjsConfig.serviceId) missing.push('VITE_EMAILJS_SERVICE_ID')
    if (!emailjsConfig.templateId) missing.push('VITE_EMAILJS_TEMPLATE_ID')
    if (!emailjsConfig.publicKey) missing.push('VITE_EMAILJS_PUBLIC_KEY')

    return {
      configured: missing.length === 0,
      missing
    }
  }
} 