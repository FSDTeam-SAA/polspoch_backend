import nodemailer from 'nodemailer'
import config from '../config'

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

interface SendEmailResponse {
  success: boolean
  error?: string
}

const sendEmail = async ({
  to,
  subject,
  html,
}: SendEmailParams): Promise<SendEmailResponse> => {
  try {
    const smtpUser = config.email.emailAddress || config.email.adminEmail
    const smtpPass = config.email.emailPass

    if (!smtpUser || !smtpPass) {
      throw new Error('Email configuration is missing')
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.ionos.es',
      port: 587,
      secure: false,
      // service: "gmail",

      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    })

    const mailOptions = {
      from: smtpUser,
      to,
      subject,
      html,
    }

    await transporter.sendMail(mailOptions)

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export default sendEmail
