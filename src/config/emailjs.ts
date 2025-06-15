// EmailJS Configuration
export const emailjsConfig = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '',
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '',
}

// EmailJS Template Variables Interface
export interface EmailTemplateParams extends Record<string, unknown> {
  from_name: string
  from_email: string
  subject: string
  message: string
  to_email: string
  reply_to: string
}

// Validation function to check if EmailJS is properly configured
export const isEmailJSConfigured = (): boolean => {
  return !!(
    emailjsConfig.serviceId &&
    emailjsConfig.templateId &&
    emailjsConfig.publicKey
  )
} 