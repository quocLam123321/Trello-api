import { Resend } from 'resend'
import { env } from '~/config/environment'

const resendInstance = new Resend(env.RESEND_API_KEY)
const adminSenderEmail = env.RESEND_ADMIN_SENDER_EMAIL || 'onboarding@resend.dev'

// hàm gửi email
const sendEmail = async ({ to, subject, html }) => {
  try {
    const data = await resendInstance.emails.send({
      from : adminSenderEmail,
      to,
      subject,
      html
    })
    return data
  } catch (error) {
    console.log('🚀 ~ sendEmail ~ error:', error)
    throw error
  }
}

export const ResendProvider = {
  sendEmail
}
