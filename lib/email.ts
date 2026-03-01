import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendFeedbackEmail(from: string, message: string) {
  const base = process.env.BASE_DOMAIN ?? "novadns.io"

  await resend.emails.send({
    from:    `NovaDNS Feedback <noreply@${base}>`,
    to:      `feedback@${base}`,
    replyTo: from,
    subject: `Feedback from ${from}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h1 style="font-size:18px;font-weight:700;margin:0 0 16px">New feedback</h1>
        <p style="font-size:14px;color:#444;white-space:pre-wrap;margin:0 0 16px">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
        <hr style="border:none;border-top:1px solid #eee;margin:16px 0"/>
        <p style="font-size:12px;color:#999">From: ${from}</p>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const base    = process.env.BASE_DOMAIN ?? "novadns.io"
  const resetUrl = `https://${base}/reset-password?token=${token}`

  await resend.emails.send({
    from:    `NovaDNS <noreply@${base}>`,
    to,
    subject: "Reset your NovaDNS password",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <div style="margin-bottom:24px">
          <span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;background:#000;color:#fff;font-weight:700;font-size:14px">N</span>
        </div>
        <h1 style="font-size:20px;font-weight:700;margin:0 0 8px">Reset your password</h1>
        <p style="color:#666;font-size:14px;margin:0 0 24px">
          Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
        </p>
        <a href="${resetUrl}"
           style="display:inline-block;background:#000;color:#fff;padding:10px 20px;font-size:14px;font-weight:600;text-decoration:none">
          Reset password
        </a>
        <p style="color:#999;font-size:12px;margin:24px 0 0">
          If you didn't request this, you can safely ignore this email.
          <br/>
          The link will expire automatically.
        </p>
      </div>
    `,
  })
}
