import { EmailService } from '@/services/emailService'

/**
 * EmailJS 配置测试工具
 */
export class EmailTestUtils {
  /**
   * 测试 EmailJS 配置
   */
  static async testConfiguration(): Promise<{
    success: boolean
    message: string
    details?: any
  }> {
    try {
      // 检查配置状态
      const configStatus = EmailService.getConfigStatus()
      
      if (!configStatus.configured) {
        return {
          success: false,
          message: `EmailJS 配置不完整，缺少以下环境变量: ${configStatus.missing.join(', ')}`,
          details: configStatus
        }
      }

      // 发送测试邮件
      const testResult = await EmailService.sendEmail({
        name: 'EmailJS 测试',
        email: 'test@timee.app',
        subject: 'EmailJS 配置测试',
        message: `这是一封测试邮件，用于验证 EmailJS 配置是否正确。

测试时间: ${new Date().toLocaleString('zh-CN')}
测试来源: Timee EmailJS 配置测试工具

如果您收到这封邮件，说明 EmailJS 配置成功！`
      })

      return {
        success: testResult.success,
        message: testResult.success 
          ? 'EmailJS 配置测试成功！请检查您的邮箱。' 
          : `EmailJS 配置测试失败: ${testResult.message}`,
        details: testResult
      }

    } catch (error) {
      return {
        success: false,
        message: `测试过程中出现错误: ${error instanceof Error ? error.message : '未知错误'}`,
        details: error
      }
    }
  }

  /**
   * 在控制台运行配置测试
   */
  static async runConsoleTest(): Promise<void> {
    console.log('🧪 开始 EmailJS 配置测试...')
    
    const result = await this.testConfiguration()
    
    if (result.success) {
      console.log('✅ EmailJS 配置测试成功！')
      console.log('📧 请检查您的邮箱是否收到测试邮件')
    } else {
      console.error('❌ EmailJS 配置测试失败')
      console.error('错误信息:', result.message)
      if (result.details) {
        console.error('详细信息:', result.details)
      }
    }
  }

  /**
   * 获取配置检查结果
   */
  static getConfigurationInfo(): {
    configured: boolean
    serviceId: string
    templateId: string
    publicKey: string
    missing: string[]
  } {
    const configStatus = EmailService.getConfigStatus()
    
    return {
      configured: configStatus.configured,
      serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID ? '已设置' : '未设置',
      templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID ? '已设置' : '未设置',
      publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY ? '已设置' : '未设置',
      missing: configStatus.missing
    }
  }
}

// 在开发环境下，将测试工具添加到全局对象，方便在控制台调用
if (import.meta.env.DEV) {
  (window as any).emailTest = EmailTestUtils
  console.log('🔧 EmailJS 测试工具已加载到 window.emailTest')
  console.log('💡 使用 emailTest.runConsoleTest() 来测试配置')
  console.log('💡 使用 emailTest.getConfigurationInfo() 来查看配置状态')
} 