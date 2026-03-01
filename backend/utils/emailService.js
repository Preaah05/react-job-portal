import nodemailer from "nodemailer";

const createTransporter = () => {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    service: process.env.SMTP_SERVICE || "gmail",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASS,
    },
  });
};

const baseLayout = (bodyHtml) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CareerConnect</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background:#07091a; color:#f1f5f9; }
    .wrapper { max-width:600px; margin:40px auto; background:#0c0f24; border-radius:16px; overflow:hidden; border:1px solid rgba(255,255,255,0.08); }
    .header { background:linear-gradient(135deg,#6366f1,#4f46e5); padding:32px 40px; text-align:center; }
    .header h1 { color:#fff; font-size:28px; font-weight:800; margin-top:12px; }
    .body { padding:36px 40px; }
    .body p { font-size:15px; line-height:1.7; color:#94a3b8; margin-bottom:14px; }
    .body p strong { color:#f1f5f9; }
    .info-card { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:20px 24px; margin:20px 0; }
    .info-card .row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.06); font-size:14px; }
    .info-card .row:last-child { border-bottom:none; }
    .info-card .row .label { color:#475569; font-weight:600; }
    .info-card .row .value { color:#f1f5f9; font-weight:500; text-align:right; max-width:60%; }
    .cta { text-align:center; margin:28px 0 10px; }
    .cta a { display:inline-block; padding:13px 32px; background:linear-gradient(135deg,#6366f1,#4f46e5); color:#fff; text-decoration:none; border-radius:8px; font-size:15px; font-weight:700; }
    .badge { display:inline-block; padding:4px 12px; border-radius:99px; font-size:12px; font-weight:700; }
    .badge.amber  { background:rgba(245,158,11,0.15); color:#f59e0b; border:1px solid rgba(245,158,11,0.3); }
    .badge.green  { background:rgba(16,185,129,0.15); color:#10b981; border:1px solid rgba(16,185,129,0.3); }
    .badge.red    { background:rgba(244,63,94,0.15);  color:#f43f5e; border:1px solid rgba(244,63,94,0.3); }
    .badge.blue   { background:rgba(99,102,241,0.15); color:#818cf8; border:1px solid rgba(99,102,241,0.3); }
    .footer { padding:20px 40px; text-align:center; background:#07091a; border-top:1px solid rgba(255,255,255,0.06); }
    .footer p { font-size:12px; color:#334155; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>CareerConnect</h1>
    </div>
    <div class="body">
      ${bodyHtml}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} CareerConnect. All rights reserved.</p>
      <p style="margin-top:6px;">This is an automated email — please do not reply.</p>
    </div>
  </div>
</body>
</html>
`;

export const newApplicationTemplate = ({ employerName, jobTitle, applicantName, applicantEmail, applicantPhone, appUrl }) =>
  baseLayout(`
    <p>Hello <strong>${employerName}</strong>,</p>
    <p>You have received a new application for your job posting. Here are the details:</p>
    <div class="info-card">
      <div class="row"><span class="label">Job Title</span><span class="value">${jobTitle}</span></div>
      <div class="row"><span class="label">Applicant</span><span class="value">${applicantName}</span></div>
      <div class="row"><span class="label">Email</span><span class="value">${applicantEmail}</span></div>
      <div class="row"><span class="label">Phone</span><span class="value">${applicantPhone}</span></div>
      <div class="row"><span class="label">Status</span><span class="value"><span class="badge amber">● Under Review</span></span></div>
    </div>
    <p>Log in to your dashboard to review the application and resume.</p>
    <div class="cta">
      <a href="${appUrl || "http://localhost:5173"}/applications/me">View Applications →</a>
    </div>
  `);

export const applicationConfirmTemplate = ({ applicantName, jobTitle, companyNote, appUrl }) =>
  baseLayout(`
    <p>Hi <strong>${applicantName}</strong>,</p>
    <p>Your application has been successfully submitted! 🎉</p>
    <div class="info-card">
      <div class="row"><span class="label">Job Applied For</span><span class="value">${jobTitle}</span></div>
      <div class="row"><span class="label">Submitted On</span><span class="value">${new Date().toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}</span></div>
      <div class="row"><span class="label">Status</span><span class="value"><span class="badge amber">● Under Review</span></span></div>
    </div>
    <p>${companyNote || "The employer will review your application and reach out if there's a match."}</p>
    <div class="cta">
      <a href="${appUrl || "http://localhost:5173"}/applications/me">View My Applications →</a>
    </div>
  `);

export const statusUpdateTemplate = ({ applicantName, jobTitle, status, message, appUrl }) => {
  const badgeMap = { Shortlisted: "green", Hired: "green", Rejected: "red" };
  const badgeClass = badgeMap[status] || "blue";
  return baseLayout(`
    <p>Hi <strong>${applicantName}</strong>,</p>
    <p>There's an update on your application:</p>
    <div class="info-card">
      <div class="row"><span class="label">Job</span><span class="value">${jobTitle}</span></div>
      <div class="row"><span class="label">New Status</span><span class="value"><span class="badge ${badgeClass}">● ${status}</span></span></div>
    </div>
    ${message ? `<p>${message}</p>` : ""}
    <p>Log in to your dashboard to see more details.</p>
    <div class="cta">
      <a href="${appUrl || "http://localhost:5173"}/applications/me">View My Applications →</a>
    </div>
  `);
};

export const welcomeTemplate = ({ name, role, appUrl }) =>
  baseLayout(`
    <p>Welcome, <strong>${name}</strong>! 👋</p>
    <p>Your CareerConnect account has been created successfully as a <strong>${role}</strong>.</p>
    <div class="info-card">
      <div class="row"><span class="label">Account Type</span><span class="value"><span class="badge blue">${role}</span></span></div>
      <div class="row"><span class="label">Joined</span><span class="value">${new Date().toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}</span></div>
    </div>
    ${role === "Employer"
      ? `<p>You can now post jobs and review applications from talented candidates.</p>`
      : `<p>You can now browse thousands of job listings and apply with a single click.</p>`
    }
    <div class="cta">
      <a href="${appUrl || "http://localhost:5173"}">Get Started →</a>
    </div>
  `);

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[Email] Skipped (SMTP not configured). Would have sent "${subject}" to ${to}`);
    return;
  }
  try {
    const info = await transporter.sendMail({
      from: `"CareerConnect" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log(`[Email] Sent "${subject}" to ${to} — ID: ${info.messageId}`);
  } catch (err) {
    console.error(`[Email] Failed to send "${subject}" to ${to}:`, err.message);
  }
};
