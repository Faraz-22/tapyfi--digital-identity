import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || "Tapyfi <onboarding@resend.dev>";

/**
 * Send a password-reset email with a secure one-time link.
 * The email uses a clean HTML template aligned with Tapyfi's dark premium aesthetic.
 */
export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<void> {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#0b0f14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b0f14;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#13181f;border:1px solid rgba(255,255,255,0.06);border-radius:16px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 0;text-align:center;">
              <p style="margin:0;font-size:14px;font-weight:700;color:#6fffe9;letter-spacing:1.5px;text-transform:uppercase;">Password Reset</p>
              <h1 style="margin:16px 0 0;font-size:24px;font-weight:600;color:#ffffff;line-height:1.3;">Reset your Tapyfi password</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:24px 32px;">
              <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.65);">
                We received a request to reset the password for your account. Click the button below to create a new password. This link expires in <strong style="color:rgba(255,255,255,0.85);">1 hour</strong>.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 24px;">
                    <a href="${resetUrl}" style="display:inline-block;padding:14px 36px;background:#6fffe9;color:#0b0f14;font-size:14px;font-weight:700;text-decoration:none;border-radius:999px;">
                      Reset Password &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 12px;font-size:13px;line-height:1.5;color:rgba(255,255,255,0.4);">
                If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
              </p>
              <p style="margin:0;font-size:12px;line-height:1.5;color:rgba(255,255,255,0.25);word-break:break-all;">
                Link: ${resetUrl}
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.3);">
                &copy; Tapyfi &middot; Digital Identity Platform
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: "Reset your Tapyfi password",
      html
    });

    if (error) {
      console.error("Resend API error:", error);
      throw new Error("Failed to send password reset email");
    }

    console.log(`Password reset email sent to ${to}`);
  } catch (err) {
    console.error("Email send failed:", err);
    throw err;
  }
}
