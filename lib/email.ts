import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

function base() { return process.env.BASE_DOMAIN ?? "novadns.io" }
function from() { return `NovaDNS <noreply@${base()}>` }
function dashUrl(path = "") { return `https://${base()}${path}` }

function layout(content: string) {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#111">
      <div style="margin-bottom:24px">
        <span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;background:#000;color:#fff;font-weight:700;font-size:14px">N</span>
      </div>
      ${content}
      <hr style="border:none;border-top:1px solid #eee;margin:32px 0 16px"/>
      <p style="font-size:12px;color:#999;margin:0">
        NovaDNS · <a href="${dashUrl()}" style="color:#999">${base()}</a>
      </p>
    </div>
  `
}

function btn(label: string, href: string) {
  return `<a href="${href}" style="display:inline-block;background:#000;color:#fff;padding:10px 20px;font-size:14px;font-weight:600;text-decoration:none;margin-top:8px">${label}</a>`
}

// ── Welcome ──────────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string) {
  await resend.emails.send({
    from: from(), to,
    subject: "Welcome to NovaDNS",
    html: layout(`
      <h1 style="font-size:20px;font-weight:700;margin:0 0 8px">Welcome, ${name}!</h1>
      <p style="color:#555;font-size:14px;margin:0 0 16px">
        Your account is ready. Create your first host and start pointing your dynamic IP
        to a stable hostname in under 5 minutes.
      </p>
      ${btn("Go to dashboard", dashUrl("/dashboard"))}
      <p style="color:#999;font-size:13px;margin:20px 0 0">
        Need help getting started? Check out the
        <a href="${dashUrl("/docs")}" style="color:#555">documentation</a> or reply to this email.
      </p>
    `),
  })
}

// ── Security alerts ───────────────────────────────────────────────────────────

export async function sendPasswordChangedEmail(to: string, name: string) {
  await resend.emails.send({
    from: from(), to,
    subject: "Your NovaDNS password was changed",
    html: layout(`
      <h1 style="font-size:20px;font-weight:700;margin:0 0 8px">Password changed</h1>
      <p style="color:#555;font-size:14px;margin:0 0 16px">
        Hi ${name}, your NovaDNS account password was just updated.
      </p>
      <p style="color:#555;font-size:14px;margin:0 0 16px">
        If this was you, no action is needed. If you didn't make this change,
        please reset your password immediately.
      </p>
      ${btn("Reset password", dashUrl("/forgot-password"))}
      <p style="color:#999;font-size:13px;margin:20px 0 0">
        If you need help, reply to this email or contact
        <a href="mailto:support@${base()}" style="color:#555">support@${base()}</a>.
      </p>
    `),
  })
}

export async function sendEmailChangedEmail(to: string, name: string, newEmail: string) {
  await resend.emails.send({
    from: from(), to,
    subject: "Your NovaDNS email address was changed",
    html: layout(`
      <h1 style="font-size:20px;font-weight:700;margin:0 0 8px">Email address changed</h1>
      <p style="color:#555;font-size:14px;margin:0 0 16px">
        Hi ${name}, the email address on your NovaDNS account was changed to
        <strong>${newEmail}</strong>.
      </p>
      <p style="color:#555;font-size:14px;margin:0 0 16px">
        If you made this change, no action is needed. If you didn't,
        contact us immediately.
      </p>
      <p style="color:#999;font-size:13px;margin:20px 0 0">
        Reply to this email or contact
        <a href="mailto:support@${base()}" style="color:#555">support@${base()}</a>.
      </p>
    `),
  })
}

// ── Billing ───────────────────────────────────────────────────────────────────

export async function sendSubscriptionUpgradedEmail(
  to: string,
  name: string,
  planLabel: string,
  hostLimit: number,
) {
  await resend.emails.send({
    from: from(), to,
    subject: `You're now on the NovaDNS ${planLabel} plan`,
    html: layout(`
      <h1 style="font-size:20px;font-weight:700;margin:0 0 8px">Plan upgraded</h1>
      <p style="color:#555;font-size:14px;margin:0 0 16px">
        Hi ${name}, your subscription has been activated. You're now on the
        <strong>${planLabel}</strong> plan with up to <strong>${hostLimit} active hosts</strong>.
      </p>
      ${btn("Go to dashboard", dashUrl("/dashboard"))}
      <p style="color:#999;font-size:13px;margin:20px 0 0">
        Manage or cancel your subscription at any time from
        <a href="${dashUrl("/dashboard/settings")}" style="color:#555">account settings</a>.
      </p>
    `),
  })
}

export async function sendSubscriptionCanceledEmail(
  to: string,
  name: string,
  disabledHosts: string[],
) {
  const hostsSection = disabledHosts.length > 0
    ? `
      <p style="color:#555;font-size:14px;margin:16px 0 8px">
        The following hosts were disabled because they exceeded the free plan limit of 3:
      </p>
      <ul style="margin:0 0 16px;padding:0 0 0 20px">
        ${disabledHosts.map(h => `<li style="font-size:14px;color:#555;font-family:monospace">${h}</li>`).join("")}
      </ul>
      <p style="color:#555;font-size:14px;margin:0 0 16px">
        Re-subscribe at any time to re-enable them.
      </p>
    `
    : ""

  await resend.emails.send({
    from: from(), to,
    subject: "Your NovaDNS subscription has ended",
    html: layout(`
      <h1 style="font-size:20px;font-weight:700;margin:0 0 8px">Subscription ended</h1>
      <p style="color:#555;font-size:14px;margin:0 0 8px">
        Hi ${name}, your NovaDNS subscription has been canceled and your account has
        been moved to the <strong>Free plan</strong> (3 hosts).
      </p>
      ${hostsSection}
      ${btn("Re-subscribe", dashUrl("/dashboard/settings"))}
    `),
  })
}

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
