import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const result = await query("SELECT * FROM users WHERE email = $1", [email.toLowerCase()]);
    const user = result.rows[0];

    if (!user) {
      return NextResponse.json({ error: "Email không tồn tại" }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Mật khẩu không chính xác" }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "hq_secret_key",
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error: any) {
    console.error("Lỗi đăng nhập:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}