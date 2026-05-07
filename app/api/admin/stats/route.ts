import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const stats = await query(`
      SELECT 
        -- 1. Chỉ tính tiền của đơn Completed
        COALESCE(SUM(CASE WHEN status = 'Completed' THEN total_amount ELSE 0 END), 0) as total_revenue,
        -- 2. Đếm số đơn Completed để hiện ở Card "Total Orders"
        COUNT(*) FILTER (WHERE status = 'Completed') as completed_orders,
        -- 3. Tổng tất cả đơn (Pending + Shipping + Completed) để làm mẫu số cho Progress Bar
        COUNT(*) as total_orders_all_status,
        -- 4. Tổng khách hàng
        (SELECT COUNT(*) FROM users) as total_customers
      FROM orders
    `);

    const s = stats.rows[0];

    // 5. Vòng tròn & Phân bổ loại hàng: CHỈ TÍNH ĐƠN COMPLETED
const categoryDist = await query(`
  SELECT 
    TRIM(LOWER(p.category)) as category, -- Xóa khoảng trắng và viết thường
    SUM(oi.quantity)::int as count, 
    SUM(oi.price * oi.quantity)::float as revenue_share
  FROM order_items oi
  JOIN products p ON oi.product_id = p.id
  JOIN orders o ON oi.order_id = o.id
  WHERE o.status = 'Completed'
  GROUP BY p.category
`);

    // 6. Trạng thái đơn (Để hiện thanh Progress Pending/Shipping/Completed)
    const statusDist = await query("SELECT status, COUNT(*)::int as count FROM orders GROUP BY status");

    // 7. Top Customers (Chỉ tính tiền đã thanh toán xong)
    const topCustomers = await query(`
      SELECT u.full_name, u.email, COUNT(o.id) as order_count, SUM(o.total_amount) as total_spent
      FROM users u
      JOIN orders o ON u.id = o.user_id
      WHERE o.status = 'Completed'
      GROUP BY u.id, u.full_name, u.email
      ORDER BY total_spent DESC LIMIT 5
    `);

    return NextResponse.json({
      revenue: parseFloat(s.total_revenue),
      orders: parseInt(s.completed_orders), // Card chính hiện số đơn xong
      totalOrdersAll: parseInt(s.total_orders_all_status), // Dùng cho thanh % status
      customers: parseInt(s.total_customers),
      revenueGrowth: "+12%", 
      statusDist: statusDist.rows || [],
      categoryDist: categoryDist.rows || [],
      topCustomers: topCustomers.rows || []
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}