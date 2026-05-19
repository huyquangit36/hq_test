import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import nodemailer from "nodemailer";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const userRes = await query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
    
    if (userRes.rows.length === 0) {
      return NextResponse.json({ error: "Email không tồn tại" }, { status: 404 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

    await query("INSERT INTO password_resets (email, token, expires_at) VALUES ($1, $2, $3)", 
      [email.toLowerCase(), token, expires]
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    await transporter.sendMail({
      from: '"HQ Streetwear" <no-reply@hq.com>',
      to: email,
      subject: "RESET YOUR PASS | HQ STREETWEAR",
      html: `<div style="background:#000; color:#fff; padding:50px; text-align:center;">
              <h1 style="color:red;">HQ.</h1>
              <p>Click link bên dưới để đổi mật khẩu (Hạn 60 phút):</p>
              <a href="${resetLink}" style="background:white; color:black; padding:15px; text-decoration:none; font-weight:bold;">RESET PASSWORD</a>
             </div>`
    });

    return NextResponse.json({ message: "Sent" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}