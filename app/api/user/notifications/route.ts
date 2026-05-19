import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) return NextResponse.json([]);

    const commentNotifs = await query(
      `SELECT c.id, c.product_id, p.name as product_name, c.created_at
       FROM comments c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = $1 AND c.is_answered = TRUE AND c.is_seen = FALSE
       ORDER BY c.created_at DESC LIMIT 5`,
      [userId]
    );

    const orderNotifs = await query(
      `SELECT id, status, created_at
       FROM orders
       WHERE user_id = $1 AND status != 'Pending' AND status_seen = FALSE
       ORDER BY created_at DESC LIMIT 5`, 
      [userId]
    );

    const allNotifs = [
      ...commentNotifs.rows.map(n => ({
        id: `c-${n.id}`,
        title: "Admin Phản Hồi",
        desc: `Về ${n.product_name}: Đã có câu trả lời.`,
        link: `/products/${n.product_id}`,
        time: n.created_at
      })),
      ...orderNotifs.rows.map(n => ({
        id: `o-${n.id}`,
        title: "Đơn Hàng: " + n.status.toUpperCase(),
        desc: `Mã #ORD-${n.id} đã được cập nhật.`,
        link: `/orders/history`,
        time: n.created_at
      }))
    ];

    return NextResponse.json(
      allNotifs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    );
  } catch (error) {
    console.error("Notif API Error:", error);
    return NextResponse.json([]);
  }
}