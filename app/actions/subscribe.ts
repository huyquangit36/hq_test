"use server";

import nodemailer from "nodemailer";
import { query } from "@/lib/db";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function subscribeAction(email: string) {
  if (!email || !email.includes("@")) {
    return { error: "INVALID COMMUNICATION PATH." };
  }

  const mailOptions = {
    from: `"HQ ARCHIVE" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "WELCOME TO THE PACK | NEURAL LINK ESTABLISHED",
    html: `
      <div style="background-color: #fafafa; color: #060c1a; padding: 50px; font-family: 'Space Grotesk', sans-serif; border: 1px solid #e5e7eb;">
        <h1 style="color: oklch(0.65 0.1 170); font-style: italic; letter-spacing: -2px; font-weight: 900; text-transform: uppercase; margin-bottom: 10px;">HQ STREETWEAR.</h1>
        <p style="text-transform: uppercase; letter-spacing: 4px; font-size: 10px; font-weight: bold; color: #64748b;">Neural Link Status: Active</p>
        <hr style="border: 0.5px solid #e5e7eb; margin: 30px 0;" />
        <p style="font-size: 16px; font-style: italic;">Welcome to the Archive.</p>
        <p style="color: #475569; line-height: 1.6;">You are now on the exclusive list for early access drops and high-end urban archives. Stay tuned for the Winter 2026 collection.</p>
        <div style="margin-top: 40px; padding: 20px; border: 2px solid oklch(0.65 0.1 170); display: inline-block;">
          <span style="font-weight: 900; color: oklch(0.65 0.1 170); text-transform: uppercase; font-style: italic;">Stay Untamed // Est. 2026</span>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: "NEURAL LINK ESTABLISHED. CHECK YOUR INBOX." };
  } catch (error) {
    console.error("Newsletter Error:", error);
    return { error: "COMMUNICATION FAILED. RETRY LATER." };
  }
}

/**
 * 02. CONTACT ACTION (Contact Protocol)
 */
export async function contactAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  if (!name || !email || !message) {
    return { error: "INCOMPLETE PROTOCOL DATA." };
  }

  try {
    await query(
      "INSERT INTO inquiries (name, email, message) VALUES ($1, $2, $3)",
      [name, email, message]
    );
  } catch (dbError) {
    console.error("Database Error:", dbError);
  }

  const mailOptions = {
    from: `"HQ SUPPORT" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "CONTACT PROTOCOL RECEIVED | HQ ARCHIVE",
    html: `
      <div style="background-color: #fafafa; color: #060c1a; padding: 50px; font-family: sans-serif; border: 1px solid #e5e7eb;">
        <h1 style="color: oklch(0.65 0.1 170); font-style: italic; letter-spacing: -2px; font-weight: 900; text-transform: uppercase;">HQ ARCHIVE.</h1>
        <p style="text-transform: uppercase; letter-spacing: 2px; font-size: 10px; color: #64748b;">Status: Analysis in Progress</p>
        <hr style="border: 0.5px solid #e5e7eb; margin: 20px 0;" />
        <p>Hello <strong>${name.toUpperCase()}</strong>,</p>
        <p>Your communication has been successfully transmitted to our team.</p>
        <div style="background-color: #f1f5f9; padding: 20px; border-left: 4px solid oklch(0.65 0.1 170); margin: 20px 0;">
          <p style="font-size: 12px; font-style: italic; margin: 0; color: #475569;">"${message}"</p>
        </div>
        <p style="font-size: 13px; line-height: 1.6;">Our Archive Team will analyze your inquiry and respond via this communication path shortly.</p>
        <p style="margin-top: 40px; font-size: 10px; color: #94a3b8; text-transform: uppercase;">Security Protocol: HMAC-SHA512 Enabled</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: "COMMUNICATION RECEIVED. CHECK YOUR INBOX." };
  } catch (error) {
    console.error("Contact Error:", error);
    return { error: "TRANSMISSION FAILED. RETRY LATER." };
  }
}