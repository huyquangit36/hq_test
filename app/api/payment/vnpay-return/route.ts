import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import crypto from "crypto";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const vnp_Params: any = Object.fromEntries(searchParams.entries());
  const secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  const sortedParams = Object.keys(vnp_Params).sort().reduce((obj: any, key) => {
    obj[key] = vnp_Params[key];
    return obj;
  }, {});

  const secretKey = process.env.VNP_HASH_SECRET!;
  const signData = new URLSearchParams(sortedParams).toString();
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

  const orderId = vnp_Params['vnp_TxnRef'];
  const responseCode = vnp_Params['vnp_ResponseCode'];

  if (secureHash === signed && responseCode === "00") {
    await query("UPDATE orders SET status = 'Paid' WHERE id = $1", [orderId]);
    return NextResponse.redirect(new URL('/orders/history?status=success', req.url));
  }
  
  return NextResponse.redirect(new URL('/orders/history?payment=failed', req.url));
}