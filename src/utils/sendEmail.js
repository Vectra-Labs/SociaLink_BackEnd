import nodemailer from "nodemailer";


  // 1️⃣ Create transporter (SMTP client)
  const transporter = nodemailer.createTransport({

    service: "gmail",

    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

export const sendVerificationEmail = async (email, code) => {


  // 2️⃣ Email content
  const mailOptions = {
    from: "SociaLink <noreply@socialink.com>",
    to: email,
    subject: "Your verification code",
    html: `
      <h2>SociaLink Email Verification</h2>
      <p>Your verification code:</p>
      <h1>${code}</h1>
      <p>This code expires in 10 minutes</p>
    `,
  };

  // 3️⃣ Send email
  await transporter.sendMail(mailOptions);
};


export const sendResetPasswordLink = async (email, link) => {
  await transporter.sendMail({
    from: "SociaLink <noreply@socialink.com>",
    to: email,
    subject: "Reset your password",
    html: `
      <h2>Password Reset</h2>
      <p>Click the button below to reset your password:</p>
      <a href="${link}">Reset Password</a>
      <p>Link expires in 15 minutes</p>
    `,
  });
};
