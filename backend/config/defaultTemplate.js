const frontendUrl = process.env.FRONTEND_URL || '#';

module.exports = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Happy Birthday!</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <!--
    Outer table: dark background with a dot-grid SVG pattern (matches app exactly)
    radial-gradient creates the dots, background-size controls spacing
  -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="
      background-color:#0a0a0a;
      background-image:radial-gradient(circle,#1f1f1f 1px,transparent 1px);
      background-size:24px 24px;
      padding:48px 16px;
    ">
    <tr>
      <td align="center">

        <!-- Main card -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
          style="max-width:520px;background-color:#111111;border-radius:12px;border:1px solid #1e1e1e;overflow:hidden;">

          <!-- Top accent line (White for Clean Mono) -->
          <tr>
            <td style="height:3px;background-color:#f5f5f5;"></td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:48px 40px 40px;" align="center">

              <!-- Label -->
              <p style="margin:0 0 16px;font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#404040;">
                BIRTHDAY REMINDER
              </p>

              <!-- Heading -->
              <h1 style="margin:0 0 6px;font-size:26px;font-weight:700;color:#f5f5f5;letter-spacing:-0.5px;">
                Happy Birthday
              </h1>

              <!-- Name -->
              <h2 style="margin:0 0 28px;font-size:20px;font-weight:500;color:#e5e5e5;letter-spacing:-0.2px;">
                \${bday.name}
              </h2>

              <!-- Thin divider -->
              <div style="width:32px;height:1px;background-color:#2a2a2a;margin:0 auto 28px;"></div>

              <!-- Message -->
              <p style="margin:0 0 32px;font-size:14px;line-height:1.8;color:#6b7280;max-width:360px;text-align:center;">
                Today is your special day and everyone at
                <span style="color:#a3a3a3;font-weight:500;">Gharda Institute of Technology</span>
                is wishing you a wonderful birthday filled with joy and growth.
              </p>

              <!-- Quote block — like the list-item card in the app -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background-color:#0d0d0d;border-radius:8px;border-left:3px solid #f5f5f5;margin-bottom:36px;text-align:left;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-size:13px;line-height:1.7;color:#525252;font-style:italic;">
                      "May this year bring you everything you've been working towards — clarity, success, and moments worth remembering."
                    </p>
                  </td>
                </tr>
              </table>



              <!-- CTA — same style as .btn-primary in the app -->
              <a href="${frontendUrl}"
                style="display:inline-block;background-color:#f5f5f5;color:#000000;font-size:13px;font-weight:700;text-decoration:none;padding:12px 32px;border-radius:6px;letter-spacing:0.3px;">
                View Birthday Board
              </a>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #1a1a1a;background-color:#0d0d0d;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <p style="margin:0 0 2px;font-size:12px;font-weight:600;color:#2a2a2a;">Birthday Reminder</p>
                    <p style="margin:0;font-size:11px;color:#1f1f1f;">Gharda Institute of Technology, Lavel</p>
                  </td>
                  <td align="right">
                    <p style="margin:0;font-size:11px;color:#1f1f1f;">Do not reply to this email.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- End card -->

      </td>
    </tr>
  </table>

</body>
</html>`;
