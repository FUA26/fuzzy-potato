/**
 * Email Service - Abstraction for sending emails
 *
 * This service provides a clean interface for sending emails.
 * In production, integrate with email providers like:
 * - Resend, SendGrid, AWS SES, Mailgun, etc.
 */

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export interface PasswordResetEmailOptions {
  to: string
  userName?: string
  resetUrl: string
}

/**
 * Send an email
 *
 * In development, this logs to console.
 * In production, integrate with your email provider.
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const isDevelopment = process.env.NODE_ENV !== 'production'

  if (isDevelopment) {
    // Development: Log email to console
    console.log('📧 EMAIL SERVICE (Development Mode)')
    console.log('─'.repeat(50))
    console.log(`To: ${options.to}`)
    console.log(`Subject: ${options.subject}`)
    console.log('─'.repeat(50))
    console.log('HTML:', options.html)
    if (options.text) {
      console.log('Text:', options.text)
    }
    console.log('─'.repeat(50))
    return true
  }

  // Production: Send real email
  // TODO: Integrate with your email provider
  //
  // Example with Resend:
  // try {
  //   const resend = new Resend(process.env.RESEND_API_KEY)
  //   await resend.emails.send({
  //     from: 'noreply@yourapp.com',
  //     to: options.to,
  //     subject: options.subject,
  //     html: options.html,
  //   })
  //   return true
  // } catch (error) {
  //   console.error('Email send error:', error)
  //   return false
  // }

  console.warn('⚠️  Email service not configured for production')
  return false
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  options: PasswordResetEmailOptions
): Promise<boolean> {
  const { to, userName, resetUrl } = options

  const greeting = userName ? `Halo ${userName},` : 'Halo,'

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Password</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Reset Password</h1>
    </div>
    <div class="content">
      <p>${greeting}</p>
      <p>Kami menerima permintaan untuk mereset password akun Anda. Jika ini adalah Anda, klik tombol di bawah untuk membuat password baru:</p>

      <div style="text-align: center;">
        <a href="${resetUrl}" class="button">Reset Password</a>
      </div>

      <p>Atau salin link ini ke browser:</p>
      <p style="word-break: break-all; color: #667eea; font-size: 12px;">${resetUrl}</p>

      <div class="warning">
        <p><strong>⚠️ Penting:</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Link ini akan kadaluarsa dalam <strong>1 jam</strong></li>
          <li>Jika Anda tidak mereset password, abaikan email ini</li>
          <li>Jangan bagikan link ini kepada siapapun</li>
        </ul>
      </div>

      <p>Jika Anda tidak meminta reset password, segera hubungi kami karena akun Anda mungkin dalam risiko.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Super App Naiera. All rights reserved.</p>
      <p>Email ini dikirim otomatis, jangan balas.</p>
    </div>
  </div>
</body>
</html>
  `

  const text = `
RESET PASSWORD - SUPER APP NAIERA

${greeting}

Kami menerima permintaan untuk mereset password akun Anda.

Untuk mereset password, kunjungi link berikut:
${resetUrl}

Link ini akan kadaluarsa dalam 1 jam.

Jika Anda tidak merinta reset password, abaikan email ini dan password Anda akan tetap sama.

© ${new Date().getFullYear()} Super App Naiera
  `

  return sendEmail({
    to,
    subject: '🔐 Reset Password - Super App Naiera',
    html,
    text,
  })
}

/**
 * Send welcome email after registration
 */
export async function sendWelcomeEmail(
  options: {
    to: string
    userName?: string
  }
): Promise<boolean> {
  const { to, userName } = options
  const greeting = userName ? `Selamat datang, ${userName}!` : 'Selamat datang!'

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Selamat Datang</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    .info { background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Selamat Datang!</h1>
    </div>
    <div class="content">
      <h2>${greeting}</h2>
      <p>Terima kasih telah mendaftar di Super App Naiera. Akun Anda telah berhasil dibuat.</p>

      <div class="info">
        <p><strong>Informasi Akun:</strong></p>
        <p>Email: ${to}</p>
      </div>

      <p>Sekarang Anda dapat:</p>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>✅ Mengakses 100+ layanan pemerintahan</li>
        <li>✅ Mengajukan perizinan usaha secara online</li>
        <li>✅ Membayar pajak dan retribusi dengan mudah</li>
        <li>✅ Mengajukan pengaduan masyarakat</li>
      </ul>

      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" class="button">Masuk Sekarang</a>
      </div>

      <p>Jika Anda memiliki pertanyaan, jangan ragu untuk menghubungi kami.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Super App Naiera. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `

  return sendEmail({
    to,
    subject: '🎉 Selamat Datang di Super App Naiera!',
    html,
  })
}
