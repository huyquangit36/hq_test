import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Dữ liệu nhận được:", body);

    const { email, password, firstName, lastName } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "Vui lòng điền đầy đủ thông tin" }, { status: 400 });
    }

    const full_name = `${firstName} ${lastName}`.trim();

    const existingUser = await query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
    
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: "Email này đã được đăng ký" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await query(
      "INSERT INTO users (full_name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, email, full_name",
      [full_name, email.toLowerCase(), hashedPassword]
    );

    return NextResponse.json({
      message: "Đăng ký thành công!",
      user: result.rows[0]
    }, { status: 201 });

  } catch (error: any) {
    console.error("Lỗi đăng ký:", error);
    return NextResponse.json({ error: "Lỗi hệ thống: " + error.message }, { status: 500 });
  }
}