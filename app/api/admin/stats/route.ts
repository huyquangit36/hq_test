import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const month = parseInt(
      searchParams.get("month") || (new Date().getMonth() + 1).toString(),
    );
    const year = parseInt(
      searchParams.get("year") || new Date().getFullYear().toString(),
    );

    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;

    // 1. LẤY THÔNG SỐ TỔNG QUÁT VÀ TĂNG TRƯỞNG
    const statsQuery = await query(
      `
      WITH current_m AS (
        SELECT 
          COALESCE(SUM(CASE WHEN status = 'Completed' THEN total_amount ELSE 0 END), 0) as rev,
          COUNT(id) FILTER (WHERE status = 'Completed') as ord_done,
          COUNT(id) FILTER (WHERE status = 'Cancelled') as ord_cancel,
          COUNT(id) as ord_total
        FROM orders 
        WHERE EXTRACT(MONTH FROM created_at) = $1 AND EXTRACT(YEAR FROM created_at) = $2
      ),
      last_m AS (
        SELECT 
          COALESCE(SUM(CASE WHEN status = 'Completed' THEN total_amount ELSE 0 END), 0) as rev,
          COUNT(id) FILTER (WHERE status = 'Completed') as ord_done
        FROM orders 
        WHERE EXTRACT(MONTH FROM created_at) = $3 AND EXTRACT(YEAR FROM created_at) = $4
      )
      SELECT 
        c.rev as curr_rev, l.rev as last_rev,
        c.ord_done as curr_ord, l.ord_done as last_ord,
        c.ord_cancel as curr_cancel, c.ord_total as curr_total,
        (SELECT COUNT(*) FROM users) as total_customers
      FROM current_m c, last_m l
    `,
      [month, year, prevMonth, prevYear],
    );

    const d = statsQuery.rows[0];

    const calcGrowth = (curr: number, last: number) => {
      const currentVal = Number(curr);
      const lastVal = Number(last);
      if (lastVal === 0) return currentVal > 0 ? "+100%" : "0%";
      const growth = ((currentVal - lastVal) / lastVal) * 100;
      return (growth >= 0 ? "+" : "") + growth.toFixed(1) + "%";
    };

    const totalOrders = parseInt(d.curr_total) || 0;
    const cancelRate =
      totalOrders > 0
        ? ((parseInt(d.curr_cancel) / totalOrders) * 100).toFixed(1)
        : "0.0";

    // 2. THỐNG KÊ THEO NGÀY (DÙNG CHO BIỂU ĐỒ)
    const dailyStats = await query(
      `
      SELECT 
        day,
        SUM(daily_revenue)::float as revenue,
        SUM(item_count)::int as count
      FROM (
        SELECT 
          EXTRACT(DAY FROM o.created_at)::int as day,
          o.total_amount as daily_revenue,
          (SELECT SUM(quantity) FROM order_items WHERE order_id = o.id) as item_count
        FROM orders o
        WHERE o.status = 'Completed' 
        AND EXTRACT(MONTH FROM o.created_at) = $1 
        AND EXTRACT(YEAR FROM o.created_at) = $2
      ) sub
      GROUP BY day 
      ORDER BY day ASC
    `,
      [month, year],
    );

    // 3. CHI TIẾT TỪNG SẢN PHẨM (DÙNG ĐỂ EXPORT EXCEL)
    const detailedItems = await query(
      `
      SELECT 
        o.id as order_id,
        o.created_at,
        p.name as product_name,
        oi.size,
        oi.quantity,
        oi.price as unit_price,
        (oi.quantity * oi.price) as subtotal
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      WHERE o.status = 'Completed'
      AND EXTRACT(MONTH FROM o.created_at) = $1
      AND EXTRACT(YEAR FROM o.created_at) = $2
      ORDER BY o.created_at DESC
    `,
      [month, year],
    );

    // 4. PHÂN BỔ THEO HẠNG MỤC (DÙNG CHO VÒNG TRÒN)
    const categoryDist = await query(
      `
      SELECT 
        p.category, 
        SUM(oi.quantity)::int as count, 
        SUM(oi.price * oi.quantity)::float as revenue_share
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'Completed' 
      AND EXTRACT(MONTH FROM o.created_at) = $1 
      AND EXTRACT(YEAR FROM o.created_at) = $2
      GROUP BY p.category
    `,
      [month, year],
    );

    // TRẢ VỀ DỮ LIỆU ĐẦY ĐỦ
    return NextResponse.json({
      revenue: parseFloat(d.curr_rev),
      orders: parseInt(d.curr_ord),
      customers: parseInt(d.total_customers),
      cancelRate: cancelRate,
      revenueGrowth: calcGrowth(d.curr_rev, d.last_rev),
      ordersGrowth: calcGrowth(d.curr_ord, d.last_ord),
      dailyStats: dailyStats.rows,
      categoryDist: categoryDist.rows,
      detailedItems: detailedItems.rows, // BẮT BUỘC PHẢI CÓ DÒNG NÀY ĐỂ EXCEL CÓ DATA
    });
  } catch (error: any) {
    console.error("STATS_API_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
