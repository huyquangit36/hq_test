import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) return NextResponse.json([]);

    // 1. Lấy thông báo từ câu hỏi đã được Admin trả lời
    const commentNotifs = await query(
      `SELECT c.id, c.product_id, p.name as product_name, 'comment' as type, c.created_at
       FROM comments c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = $1 AND c.is_answered = TRUE AND c.is_seen = FALSE`,
      [userId]
    );

    // 2. Lấy thông báo từ đơn hàng đã thay đổi trạng thái (Khác Pending)
    const orderNotifs = await query(
      `SELECT id, status, 'order' as type, created_at
       FROM orders
       WHERE user_id = $1 AND status != 'Pending' AND status_seen = FALSE`,
      [userId]
    );

    // Gom tất cả lại
    const allNotifs = [
      ...commentNotifs.rows.map(n => ({
        id: `c-${n.id}`,
        title: "Admin Phản Hồi",
        desc: `Câu hỏi về ${n.product_name} đã có lời giải đáp.`,
        link: `/products/${n.product_id}`,
        time: n.created_at
      })),
      ...orderNotifs.rows.map(n => ({
        id: `o-${n.id}`,
        title: "Cập Nhật Đơn Hàng",
        desc: `Đơn hàng #ORD-${n.id} đã chuyển sang: ${n.status}`,
        link: `/orders/history`,
        time: n.created_at
      }))
    ];

    return NextResponse.json(allNotifs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()));
  } catch (error) {
    return NextResponse.json([]);
  }
}