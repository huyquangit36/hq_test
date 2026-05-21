import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    // JOIN với bảng orders để lấy thông số mua hàng của từng khách
    const result = await query(`
      SELECT 
        u.id, u.full_name, u.email, u.role, u.created_at,
        COUNT(o.id) FILTER (WHERE o.status = 'Completed') as order_count,
        COALESCE(SUM(CASE WHEN o.status = 'Completed' THEN o.total_amount ELSE 0 END), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId, full_name, email, role, password } = await req.json();
    
    // Nếu có đổi mật khẩu thì băm mới, không thì giữ nguyên
    if (password && password.trim() !== "") {
      const hashed = await bcrypt.hash(password, 10);
      await query(
        "UPDATE users SET full_name=$1, email=$2, role=$3, password=$4 WHERE id=$5",
        [full_name, email, role, hashed, userId]
      );
    } else {
      await query(
        "UPDATE users SET full_name=$1, email=$2, role=$3 WHERE id=$4",
        [full_name, email, role, userId]
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}