"use server";

import nodemailer from "nodemailer";

export async function subscribeAction(email: string) {
  if (!email || !email.includes("@")) {
    return { error: "INVALID EMAIL ADDRESS." };
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"HQ STREETWEAR" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "WELCOME TO THE PACK | EXCLUSIVE EARLY ACCESS",
    html: `
      <div style="background-color: #000; color: #fff; padding: 40px; font-family: sans-serif; text-align: center;">
        <h1 style="color: #ff0000; font-style: italic; letter-spacing: -2px;">HQ STREETWEAR.</h1>
        <p style="text-transform: uppercase; letter-spacing: 2px; font-size: 14px;">Welcome to the Pack.</p>
        <hr style="border: 0.5px solid #333; margin: 20px 0;" />
        <p>Thank you for subscribing. You are now on our exclusive list.</p>
        <p style="color: #888;">You will receive early access to our upcoming "New Era Collection 2026" and members-only drops.</p>
        <div style="margin-top: 30px; padding: 15px; border: 1px solid #ff0000; display: inline-block;">
          <span style="font-weight: bold; color: #ff0000;">STAY UNTAMED.</span>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: "WELCOME TO THE PACK. CHECK YOUR INBOX." };
  } catch (error) {
    console.error("Mail Error:", error);
    return { error: "SYSTEM ERROR. TRY AGAIN LATER." };
  }
}